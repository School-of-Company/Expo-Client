import axios from 'axios';
import { toKoreanServerText } from '@/shared/libs/handler/serverMessage';
import { ApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import type { OwnerFieldRegistration } from './myApplications';

/** 일행 한 명의 오늘(KST) 방문일 상태(Expo-Application-Server#311) */
export interface FieldVisitPartyParticipant {
  participantId: number;
  name: string;
  representative: boolean;
  // 오늘 회차에 확정된 사전등록이 있다
  preregistered: boolean;
  // 오늘 방문일의 현장등록. 없으면 null
  fieldVisit: OwnerFieldRegistration | null;
  // 방문일 없이 남은 예전 현장등록. 오늘 등록으로 간주하지 않는다
  legacyFieldDateUnknown: boolean;
}

export interface FieldVisitParty {
  // 서버가 판정한 오늘 방문일(KST) yyyy-MM-dd
  visitDate: string;
  participants: FieldVisitPartyParticipant[];
  // 응답 헤더 X-CSRF-TOKEN. 등록 요청 헤더에 그대로 싣는다
  csrfToken?: string;
}

export type FieldVisitOutcome =
  | 'REGISTERED_FIELD'
  | 'REUSED_FIELD'
  | 'REUSED_PRE';

export interface FieldVisitParticipantResult {
  participantId: number;
  clientReference: string | null;
  outcome: FieldVisitOutcome;
}

export interface FieldVisitReceipt {
  visitDate: string;
  participants: FieldVisitParticipantResult[];
}

export interface NewFieldParticipant {
  clientReference: string;
  name: string;
  occupation: string;
  school?: string;
  region: string;
  informationJson?: string;
}

export interface RegisterFieldVisitBody {
  participantIds: number[];
  newParticipants: NewFieldParticipant[];
}

/** 새 동행자 등록을 서버가 거절했을 때 오는 사유 코드 */
export const PARTY_LIMIT_EXCEEDED = 'PARTY_LIMIT_EXCEEDED';

const COMMON_ERRORS: Record<number, string> = {
  400: '선택한 참가자나 동행자 정보를 다시 확인해주세요. 등록 기간이 아닐 수도 있습니다.',
  401: '본인 인증이 필요하거나 인증이 만료되었습니다.',
  403: '요청을 확인하지 못했습니다. 새로고침 후 다시 시도해주세요.',
  404: '일행 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.',
  409: '현재 상태와 충돌해 등록하지 못했습니다. 새로고침 후 다시 확인해주세요.',
  502: '서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  503: '지금은 현장등록을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

const FIELD_VISIT_CODE_MESSAGES: Record<string, string> = {
  [PARTY_LIMIT_EXCEEDED]:
    '일행은 대표자 포함 최대 5명입니다. 새 동행자를 더 추가할 수 없습니다.',
  FIELD_CANCELLATION_PENDING:
    '현장등록 취소를 처리하고 있습니다. 잠시 후 다시 시도해주세요.',
  EXPO_DELETED: '삭제된 박람회입니다.',
};

const toError = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error) || !error.response) return error;
  const { status, data } = error.response;
  const code = typeof data?.code === 'string' ? data.code : undefined;
  // 서버 본문이 코드 자체(PARTY_LIMIT_EXCEEDED)인 409 도 있어 message 도 사유 코드로 본다
  const reason =
    code ?? (typeof data?.message === 'string' ? data.message : undefined);
  return new ApiError(
    (reason && FIELD_VISIT_CODE_MESSAGES[reason]) ||
      (status === 400 ? toKoreanServerText(data) : undefined) ||
      COMMON_ERRORS[status] ||
      fallback,
    status,
    reason,
  );
};

/** 인증한 번호의 기존 일행과 오늘 방문일 등록 상태. 응답은 캐시하지 않는다 */
export const getFieldVisitParty = async (
  expoId: string,
): Promise<FieldVisitParty> => {
  try {
    const { data, headers } = await clientInstance.get<FieldVisitParty>(
      `/application/expos/${encodeURIComponent(expoId)}/field-visits`,
    );
    return { ...data, csrfToken: headers['x-csrf-token'] };
  } catch (error) {
    throw toError(error, '현장등록 내역을 불러오지 못했습니다.');
  }
};

/**
 * 선택한 기존 참가자와 신규 동행자의 오늘 방문일 등록. 기존 참가자의 프로필과 QR 은 바뀌지 않는다.
 * 같은 Idempotency-Key 로 다시 보내면 서버가 같은 결과를 돌려준다
 */
export const registerFieldVisits = async (
  expoId: string,
  body: RegisterFieldVisitBody,
  idempotencyKey: string,
  csrfToken?: string,
): Promise<FieldVisitReceipt> => {
  try {
    const { data } = await clientInstance.post<FieldVisitReceipt>(
      `/application/expos/${encodeURIComponent(expoId)}/field-visits`,
      { ...body, personalInformationStatus: true },
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Idempotency-Key': idempotencyKey,
        },
      },
    );
    return data;
  } catch (error) {
    throw toError(error, '현장등록에 실패했습니다.');
  }
};
