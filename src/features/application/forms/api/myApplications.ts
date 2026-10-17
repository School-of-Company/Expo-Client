import axios from 'axios';
import {
  AdminApplicationStatus,
  AdminOccupation,
} from '@/features/registration/common/api/ledgerApi';
import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';

export type OwnerApplicationType = 'PREREGISTER' | 'STANDARD' | 'TRAINING';

type JsonNode =
  | string
  | number
  | boolean
  | null
  | JsonNode[]
  | { [key: string]: JsonNode };

export interface OwnerParticipant {
  participantId: number;
  name: string;
  occupation: AdminOccupation | null;
  representative: boolean;
}

export interface OwnerApplication {
  applicationId: string;
  type: OwnerApplicationType;
  participantId: number;
  sessionOrProgramId: number;
  status: AdminApplicationStatus;
  applied: boolean;
  questions: JsonNode | null;
  answers: JsonNode | null;
  history: { status: string }[];
  cancellable: boolean;
  // 취소 가능하면 빈 문자열
  cancellationBlockedReason: string;
}

export interface OwnerApplicationsResponse {
  participants: OwnerParticipant[];
  applications: OwnerApplication[];
}

export interface MyApplications extends OwnerApplicationsResponse {
  // 응답 헤더 X-CSRF-TOKEN. 취소 요청 헤더에 그대로 싣는다
  csrfToken?: string;
}

const COMMON_ERRORS: Record<number, string> = {
  400: '잘못된 요청입니다. 다시 확인해주세요.',
  401: '본인 인증이 필요하거나 인증이 만료되었습니다.',
  404: '대상을 찾을 수 없습니다.',
  409: '현재 상태와 충돌해 처리할 수 없습니다. 새로고침 후 다시 시도해주세요.',
  502: '서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  503: '연동 서버를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

const toError = (
  error: unknown,
  messages: Record<number, string>,
  fallback: string,
) => {
  const status = getErrorStatus(error);
  if (status === undefined) return error;
  // 401 은 코드로 SESSION_REQUIRED(미인증)와 SESSION_EXPIRED(만료)를 가른다
  const code = axios.isAxiosError(error) ? error.response?.data?.code : null;
  return new ApiError(
    messages[status] ?? fallback,
    status,
    typeof code === 'string' ? code : undefined,
  );
};

export const getMyApplications = async (
  expoId: string,
): Promise<MyApplications> => {
  try {
    const { data, headers } =
      await clientInstance.get<OwnerApplicationsResponse>(
        `/application/expos/${expoId}/my-applications`,
      );
    return { ...data, csrfToken: headers['x-csrf-token'] };
  } catch (error) {
    throw toError(error, COMMON_ERRORS, '신청 내역을 불러오지 못했습니다.');
  }
};

export const cancelMyApplication = async (
  expoId: string,
  type: OwnerApplicationType,
  applicationId: string,
  csrfToken?: string,
) => {
  try {
    await clientInstance.post(
      `/application/expos/${expoId}/my-applications/${type}/${applicationId}/cancellation`,
      undefined,
      { headers: { 'X-CSRF-TOKEN': csrfToken } },
    );
  } catch (error) {
    throw toError(
      error,
      {
        ...COMMON_ERRORS,
        403: '요청을 확인하지 못했습니다. 새로고침 후 다시 시도해주세요.',
        404: '취소할 신청을 찾을 수 없습니다.',
        409: '취소할 수 없는 신청입니다. 새로고침 후 다시 확인해주세요.',
      },
      '신청 취소에 실패했습니다.',
    );
  }
};

/**
 * 사전등록 대기 일행. 대기자는 User 에 저장되기 전이라 my-applications 참가자 목록에 없고 QR 도 없다.
 * PROCESSING 은 승급 뒤 저장 중, PROMOTION_ENDED 는 회차 시작으로 승급이 끝난 상태다.
 */
export interface MyPreRegisterWaitlist {
  sessionId: number;
  /** 대표자를 포함한 일행 인원 */
  applicants: number;
  status: 'WAITING' | 'PROCESSING' | 'PROMOTION_ENDED';
  /** 일행 단위 대기 순번(1부터). WAITING 이 아니면 null */
  position: number | null;
  csrfToken?: string;
}

// 404 는 대기 일행이 없다는 뜻이라 null 로 돌려준다. 그 밖의 오류는 대기 없음으로 위장하지 않는다
export const getMyPreRegisterWaitlist = async (
  expoId: string,
): Promise<MyPreRegisterWaitlist | null> => {
  try {
    const { data, headers } = await clientInstance.get<MyPreRegisterWaitlist>(
      `/application/expos/${expoId}/my-applications/preregister-waitlist`,
    );
    return { ...data, csrfToken: headers['x-csrf-token'] };
  } catch (error) {
    if (getErrorStatus(error) === 404) return null;
    throw toError(error, COMMON_ERRORS, '대기 내역을 불러오지 못했습니다.');
  }
};

/** 대기 일행 전체 취소. 일부만 취소할 수 없고, 취소한 대기는 같은 신청으로 되살릴 수 없다 */
export const cancelMyPreRegisterWaitlist = async (
  expoId: string,
  csrfToken?: string,
) => {
  try {
    await clientInstance.post(
      `/application/expos/${expoId}/my-applications/preregister-waitlist/cancellation`,
      undefined,
      { headers: { 'X-CSRF-TOKEN': csrfToken } },
    );
  } catch (error) {
    throw toError(
      error,
      {
        ...COMMON_ERRORS,
        403: '요청을 확인하지 못했습니다. 새로고침 후 다시 시도해주세요.',
        404: '취소할 대기 신청이 없습니다.',
        409: '대기에서 확정으로 처리 중이라 지금은 취소할 수 없습니다. 잠시 후 다시 확인해주세요.',
      },
      '대기 취소에 실패했습니다.',
    );
  }
};

// 대표자가 소유한 확정 참가자의 입장 QR 값. 현장 체크인 스캐너는 { participantId, code } 를 읽는다
export const getParticipantQr = async (
  expoId: string,
  participantId: number,
): Promise<{ participantId: number; code: string }> => {
  try {
    const { data } = await clientInstance.get(
      `/application/expos/${expoId}/participants/${participantId}/qr`,
    );
    return data;
  } catch (error) {
    throw toError(error, COMMON_ERRORS, 'QR 을 불러오지 못했습니다.');
  }
};

/** 대기에서 올라온 참여 제안. 수락 가능 여부는 서버 respondable 만 따르고, expiresAt 은 표시용이다 */
export interface PromotionOffer {
  offerId: string;
  target: 'PROGRAM' | 'PREREGISTER';
  // target 이 PREREGISTER 이면 programType·programId 는 없고 sessionId 만 온다
  programType: 'STANDARD' | 'TRAINING' | null;
  programId: number | null;
  sessionId: number | null;
  title: string | null;
  seats: number;
  status: 'PENDING' | 'OPEN' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'ENDED';
  respondable: boolean;
  expiresAt: string | null;
}

export interface MyPromotionOffers {
  offers: PromotionOffer[];
  csrfToken?: string;
}

export const getMyPromotionOffers = async (
  expoId: string,
): Promise<MyPromotionOffers> => {
  try {
    const { data, headers } = await clientInstance.get<PromotionOffer[]>(
      `/application/expos/${expoId}/my-applications/promotion-offers`,
    );
    return { offers: data, csrfToken: headers['x-csrf-token'] };
  } catch (error) {
    throw toError(error, COMMON_ERRORS, '참여 제안을 불러오지 못했습니다.');
  }
};

// 서버가 멱등이라 같은 요청을 반복해도 같은 결과다. 409 는 대기를 유지하므로 사유(code)를 보존해 안내한다
export const respondPromotionOffer = async (
  expoId: string,
  offerId: string,
  action: 'acceptance' | 'decline',
  csrfToken?: string,
) => {
  try {
    await clientInstance.post(
      `/application/expos/${expoId}/my-applications/promotion-offers/${offerId}/${action}`,
      undefined,
      { headers: { 'X-CSRF-TOKEN': csrfToken } },
    );
  } catch (error) {
    throw toError(
      error,
      {
        ...COMMON_ERRORS,
        403: '요청을 확인하지 못했습니다. 새로고침 후 다시 시도해주세요.',
        404: '해당 제안을 찾을 수 없습니다.',
      },
      '제안 응답에 실패했습니다.',
    );
  }
};
