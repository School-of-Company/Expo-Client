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
  return status === undefined
    ? error
    : new ApiError(messages[status] ?? fallback, status);
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

export interface PreRegisterWaitlist {
  sessionId: number;
  applicants: number;
  // WAITING 외에 승급 처리 중 상태가 올 수 있어 문자열로 받는다
  status: string;
  position: number;
  // 응답 헤더 X-CSRF-TOKEN. 대기 취소 요청 헤더에 그대로 싣는다
  csrfToken?: string;
}

// 대기 일행이 없으면(404) null. 참가자 세션이 없을 때(401)도 정상 흐름이라 null
export const getPreRegisterWaitlist = async (
  expoId: string,
): Promise<PreRegisterWaitlist | null> => {
  try {
    const { data, headers } = await clientInstance.get<PreRegisterWaitlist>(
      `/application/expos/${expoId}/my-applications/preregister-waitlist`,
    );
    return { ...data, csrfToken: headers['x-csrf-token'] };
  } catch (error) {
    const status = getErrorStatus(error);
    if (status === 401 || status === 404) return null;
    throw toError(error, COMMON_ERRORS, '대기 내역을 불러오지 못했습니다.');
  }
};

// 대기 일행 전체를 취소한다. 취소한 대기의 Idempotency-Key 로는 다시 신청할 수 없다
export const cancelPreRegisterWaitlist = async (
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
        404: '취소할 대기 신청을 찾을 수 없습니다.',
        409: '대기에서 확정으로 처리 중이거나 삭제된 행사라 취소할 수 없습니다. 잠시 후 다시 확인해주세요.',
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
