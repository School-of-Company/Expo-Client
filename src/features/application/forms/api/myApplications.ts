import axios from 'axios';
import {
  AdminApplicationStatus,
  AdminOccupation,
} from '@/features/registration/common/api/ledgerApi';
import { toKoreanServerText } from '@/shared/libs/handler/serverMessage';
import { ApiError, getErrorStatus } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import type { Companion } from '@/shared/types/application/type';

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
  /**
   * 대표자 본인의 확정 사전등록에 동행자를 더 추가할 수 있는지(Expo-Application-Server#169).
   * 서버 배포 전 응답에는 없으므로 없으면 추가할 수 없다고 본다
   */
  companionAddable?: boolean;
  /** 지금 더 추가할 수 있는 동행자 수. 동행자 상한(대표자 포함 5명)과 회차 잔여·대기석 중 작은 값 */
  remainingCompanionSlots?: number;
  /** 추가할 수 없는 사유 코드. 가능하면 빈 문자열 */
  companionAddBlockedReason?: string;
}

export interface OwnerApplicationsResponse {
  participants: OwnerParticipant[];
  applications: OwnerApplication[];
  /**
   * 개인 QR 을 조회할 수 있는 참가자 ID(Expo-Application-Server#250). 확정 사전등록 또는 사전등록 이력 없는
   * 현장등록 참가자이며 신청이 없어도 들어간다. 출석 연동이 꺼졌거나 예전 서버면 비어 있거나 없다
   */
  qrParticipantIds?: number[];
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

/**
 * 같은 회차에 확정된 동행자가 남아 있으면 대표자 취소를 막는다(Application #257).
 * 내 신청 조회의 cancellationBlockedReason 과 취소 409 code 가 같은 값이다
 */
export const COMPANIONS_ACTIVE_MESSAGE =
  '동행자 신청을 먼저 취소해 주세요. 동행자를 모두 취소하면 대표자 신청도 취소할 수 있습니다.';

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
    const apiError = toError(
      error,
      {
        ...COMMON_ERRORS,
        403: '요청을 확인하지 못했습니다. 새로고침 후 다시 시도해주세요.',
        404: '취소할 신청을 찾을 수 없습니다.',
        409: '취소할 수 없는 신청입니다. 새로고침 후 다시 확인해주세요.',
      },
      '신청 취소에 실패했습니다.',
    );
    // 화면이 오래되어 버튼이 열려 있었던 경우. 목록은 취소 시도 뒤 다시 받는다
    if (apiError instanceof ApiError && apiError.code === 'COMPANIONS_ACTIVE')
      throw new ApiError(
        COMPANIONS_ACTIVE_MESSAGE,
        apiError.status,
        apiError.code,
      );
    throw apiError;
  }
};

/** 동행자 추가 결과. CONFIRMED 만 새 동행자의 QR 이 대표자 번호로 발송된다 */
export interface AddCompanionsResult {
  applicationId: string;
  /** 새로 확정된 동행자 참가자 ID. 대기·처리 중이면 빈 목록 */
  participantIds: number[];
  /** WAITING: 자리가 모자라 회차 대기열에 섬, PROCESSING: 승급 뒤 저장 중 */
  status: 'CONFIRMED' | 'WAITING' | 'PROCESSING';
  /** WAITING 일 때 회차 대기 순번(1부터) */
  position: number | null;
}

/**
 * 확정된 내 사전등록 일행에 동행자를 더한다(Expo-Application-Server#169).
 * 같은 Idempotency-Key 로 다시 보내면 서버가 같은 추가를 이어서 처리한다.
 * 409 사유(정원·상한 초과, 마감·시작된 회차, 기간 아님, 처리 중인 추가 등)는 서버 문구가 더 정확해 그대로 쓴다
 */
export const addMyPreRegisterCompanions = async (
  expoId: string,
  applicationId: string,
  companions: Companion[],
  idempotencyKey: string,
  csrfToken?: string,
): Promise<AddCompanionsResult> => {
  try {
    const { data } = await clientInstance.post<AddCompanionsResult>(
      `/application/expos/${expoId}/my-applications/PREREGISTER/${applicationId}/companions`,
      { companions },
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Idempotency-Key': idempotencyKey,
        },
      },
    );
    return data;
  } catch (error) {
    const serverText = axios.isAxiosError(error)
      ? toKoreanServerText(error.response?.data)
      : undefined;
    throw toError(
      error,
      {
        ...COMMON_ERRORS,
        400: serverText ?? '동행자 정보를 다시 확인해주세요.',
        403: '요청을 확인하지 못했습니다. 새로고침 후 다시 시도해주세요.',
        404: '동행자를 추가할 신청을 찾을 수 없습니다.',
        409:
          serverText ??
          '지금은 동행자를 추가할 수 없습니다. 새로고침 후 다시 확인해주세요.',
        503: '일시적으로 처리할 수 없습니다. 잠시 후 같은 내용으로 다시 시도해주세요.',
      },
      '동행자 추가에 실패했습니다.',
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

/**
 * 회차별 대기 목록(최근 순, 없으면 빈 배열). 회차마다 따로 대기할 수 있다(Expo-Application-Server#198).
 * 이 경로가 없는 서버(404)는 예전 단건 조회로 돌아간다
 */
export const getMyPreRegisterWaitlists = async (
  expoId: string,
): Promise<MyPreRegisterWaitlist[]> => {
  try {
    const { data, headers } = await clientInstance.get<MyPreRegisterWaitlist[]>(
      `/application/expos/${expoId}/my-applications/preregister-waitlists`,
    );
    const csrfToken = headers['x-csrf-token'];
    return data.map((waitlist) => ({ ...waitlist, csrfToken }));
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      const waitlist = await getMyPreRegisterWaitlist(expoId);
      return waitlist ? [waitlist] : [];
    }
    throw toError(error, COMMON_ERRORS, '대기 내역을 불러오지 못했습니다.');
  }
};

/** 그 회차의 대기 일행 전체 취소. 일부만 취소할 수 없고, 취소한 대기는 같은 신청으로 되살릴 수 없다 */
export const cancelMyPreRegisterWaitlist = async (
  expoId: string,
  sessionId: number,
  csrfToken?: string,
) => {
  try {
    await clientInstance.post(
      `/application/expos/${expoId}/my-applications/preregister-waitlist/cancellation`,
      undefined,
      { headers: { 'X-CSRF-TOKEN': csrfToken }, params: { sessionId } },
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

/** 다른 회차 추가 결과. 확정이면 참석자 ID, 대기면 회차 대기 순번이 온다 */
export interface AddSessionResult {
  status: 'CONFIRMED' | 'WAITING' | 'PROCESSING';
  position?: number | null;
  participantIds?: number[];
}

/**
 * 이미 신청한 일행이 답변을 다시 쓰지 않고 다른 회차를 추가한다(Expo-Application-Server#199).
 * 참석자는 일행 중에서 고르고 대표자는 빠져도 되지만, 학생만 남으면 거절된다.
 * 409 FORM_CHANGED 는 신청 뒤 사전등록 폼이 바뀌어 처음 신청부터 다시 해야 한다는 뜻이다
 */
export const addMyPreRegisterSession = async (
  expoId: string,
  body: { sessionId: number; participantIds: number[] },
  idempotencyKey: string,
  csrfToken?: string,
): Promise<AddSessionResult> => {
  try {
    const { data } = await clientInstance.post<AddSessionResult>(
      `/application/expos/${expoId}/my-applications/preregister-sessions`,
      body,
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Idempotency-Key': idempotencyKey,
        },
      },
    );
    return data;
  } catch (error) {
    const serverText = axios.isAxiosError(error)
      ? toKoreanServerText(error.response?.data)
      : undefined;
    throw toError(
      error,
      {
        ...COMMON_ERRORS,
        400: serverText ?? '참석자를 다시 확인해주세요.',
        403: '요청을 확인하지 못했습니다. 새로고침 후 다시 시도해주세요.',
        404: '신청한 일행이나 회차를 찾을 수 없습니다.',
        409:
          serverText ??
          '이 회차는 지금 추가할 수 없습니다. 이미 신청했거나 시간이 겹치거나 접수가 끝났을 수 있습니다.',
        503: '일시적으로 처리할 수 없습니다. 잠시 후 같은 내용으로 다시 시도해주세요.',
      },
      '회차를 추가하지 못했습니다.',
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
