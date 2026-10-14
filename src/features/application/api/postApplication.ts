import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import { FormattedApplicationData } from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';

const URL_MAP: Record<string, string> = {
  STANDARD_PRE: '/application/pre-standard/',
  TRAINEE_PRE: '/application/',
  STANDARD_FIELD: '/application/field/standard/',
  TRAINEE_FIELD: '/application/field/',
};

const MAX_NETWORK_RETRIES = 2;

const APPLICATION_ERROR_MESSAGES: Record<number, string> = {
  400: '신청 기간이 아니거나 입력한 답변이 올바르지 않습니다.',
  401: '인증이 만료되었습니다. 다시 인증한 뒤 신청해주세요.',
  403: '이 신청을 할 권한이 없습니다. 다시 인증해주세요.',
  404: '신청서나 회차를 찾을 수 없습니다. 안내받은 링크를 다시 확인해주세요.',
  409: '이미 신청했거나 신청 정보가 바뀌었습니다. 내 신청을 확인한 뒤 다시 시도해주세요.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  502: '서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  503: '일시적으로 등록할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

// 서버 오류 코드로 상태 코드보다 구체적으로 안내한다
const APPLICATION_ERROR_CODE_MESSAGES: Record<string, string> = {
  WAITLIST_WITHDRAWN:
    '취소한 대기 신청입니다. 다시 신청하려면 처음부터 새로 신청해주세요.',
};

/** 제출 실패. 화면이 인증 만료(401)·키 교체가 필요한 코드를 구분할 수 있게 상태와 코드를 남긴다. */
export class ApplicationSubmitError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

/** 사전등록 대기 제출(202) 응답. 201 확정은 본문이 없다. */
export interface ApplicationWaitResult {
  status: 'WAITING' | 'PROCESSING';
  sessionId?: number;
  position?: number;
}

const submit = async (
  url: string,
  data: unknown,
  idempotencyKey?: string,
  extraHeaders?: Record<string, string>,
  messages: Record<number, string> = APPLICATION_ERROR_MESSAGES,
) => {
  const headers = {
    ...extraHeaders,
    ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }),
  };
  const retryable = !!idempotencyKey;

  for (let attempt = 0; ; attempt++) {
    try {
      return await clientInstance.post(url, data, { headers });
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;

      // 응답을 받지 못한 네트워크 오류는 같은 Idempotency-Key로 재시도합니다.
      if (!error.response && retryable && attempt < MAX_NETWORK_RETRIES) {
        continue;
      }

      if (error.response) {
        const { status, data: body } = error.response;
        const code = typeof body?.code === 'string' ? body.code : undefined;
        const fallback = messages[status] || '폼 등록 실패';
        throw new ApplicationSubmitError(
          (code && APPLICATION_ERROR_CODE_MESSAGES[code]) ||
            body?.error ||
            body?.message ||
            fallback,
          status,
          code,
        );
      }

      throw error;
    }
  }
};

export const postApplication = async (
  params: string,
  formType: 'application',
  userType: 'STANDARD' | 'TRAINEE',
  applicationType: ApplicationType,
  data: FormattedApplicationData,
  idempotencyKey?: string,
) => {
  const url = `${URL_MAP[`${userType}_${applicationType}`] || '/api/application/'}${params}`;
  return (await submit(url, data, idempotencyKey)).data;
};

// 연수 프로그램별 신청의 상태 코드 안내. 서버 본문의 error/message 가 있으면 그쪽이 우선한다.
// TODO(api): 409(같은 묶음 활성 신청·폼 버전 변경)와 403(허용 직업 아님) 을 본문 code 로 가르는지는
// Application #43 계약 확정 전이라 모른다. 지금은 상태 코드 문구에 두 경우를 함께 적는다.
const TRAINING_APPLY_ERROR_MESSAGES: Record<number, string> = {
  ...APPLICATION_ERROR_MESSAGES,
  403: '이 연수를 신청할 수 없는 대상입니다(허용되지 않은 직업이거나 인증이 필요합니다). 안내를 확인하거나 다시 인증해주세요.',
  409: '같은 묶음의 다른 연수를 이미 신청했거나, 정원·대기가 마감됐거나, 신청서가 바뀌었습니다. 내 신청을 확인하고 신청서를 다시 불러온 뒤 시도해주세요.',
};

/** 프로그램별 신청 결과. 201 은 확정, 202 는 대기(또는 처리 중). */
export type TrainingApplyResult = 'CONFIRMED' | 'WAITING' | 'PROCESSING';

// TODO(api): 경로는 이슈 #370 계약. 요청 본문 키(formVersion/answers)와 202 본문의 status 값은
// Application #43 에서 확정되기 전까지 미확인이다.
export const postTrainingProgramApplication = async (
  expoId: string,
  programId: string,
  payload: unknown,
  csrfHeaders: Record<string, string>,
  idempotencyKey: string,
): Promise<TrainingApplyResult> => {
  const response = await submit(
    `/application/expos/${encodeURIComponent(expoId)}/program-sessions/TRAINING/${encodeURIComponent(programId)}/applications`,
    payload,
    idempotencyKey,
    csrfHeaders,
    TRAINING_APPLY_ERROR_MESSAGES,
  );
  // 서버는 대기 접수도 201 로 주고 본문 status 에 CONFIRMED/WAITING 을 담는다. 202 는 처리 중(또는 대기)이다.
  const status = response.data?.status;
  if (status === 'WAITING' || status === 'PROCESSING') return status;
  if (response.status === 202) return 'WAITING';
  return 'CONFIRMED';
};
