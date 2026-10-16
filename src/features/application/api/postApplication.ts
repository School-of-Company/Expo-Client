import axios from 'axios';
import { toStatusMessage } from '@/shared/libs/handler/serverMessage';
import clientInstance from '@/shared/libs/http/clientInstance';
import { FormattedApplicationData } from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { ProgramType } from '@/shared/types/program/list/type';

const URL_MAP: Record<string, string> = {
  STANDARD_PRE: '/application/pre-standard/',
  TRAINEE_PRE: '/application/',
  STANDARD_FIELD: '/application/field/standard/',
  TRAINEE_FIELD: '/application/field/',
};

const MAX_NETWORK_RETRIES = 2;

const APPLICATION_ERROR_MESSAGES: Record<number, string> = {
  400: '신청이 거절되었습니다. 입력한 답변(직업·지역·소속 학교 등)과 신청 기간을 확인한 뒤 다시 시도해주세요.',
  401: '인증이 만료되었습니다. 다시 인증한 뒤 신청해주세요.',
  403: '이 신청을 할 권한이 없습니다. 다시 인증해주세요.',
  404: '신청서나 회차를 찾을 수 없습니다. 안내받은 링크를 다시 확인해주세요.',
  // 서버는 정원 부족(일행 전체 거절)·중복 신청·마감을 같은 409 로 사유 없이 보낸다
  409: '남은 자리가 부족하거나, 이미 신청했거나, 신청이 마감되어 접수되지 않았습니다. 일행은 나뉘지 않고 함께 거절됩니다. 내 신청을 확인한 뒤 다시 시도해주세요.',
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
        // 서버가 사유를 주지 않으면 프록시가 상태별 공통 문구를 싣는다. 그때는 신청 화면용 안내를 쓴다
        const serverText = body?.error || body?.message;
        const specific =
          serverText !== toStatusMessage(status) ? serverText : undefined;
        throw new ApplicationSubmitError(
          (code && APPLICATION_ERROR_CODE_MESSAGES[code]) ||
            specific ||
            messages[status] ||
            serverText ||
            '폼 등록 실패',
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

// 프로그램별 신청(일반·연수 공통)의 상태 코드 안내. 서버 본문의 error/message 가 있으면 그쪽이 우선한다.
const PROGRAM_APPLY_ERROR_MESSAGES: Record<number, string> = {
  400: '요청이나 신청서 답변이 올바르지 않습니다. 입력 내용을 확인해주세요.',
  401: '참가자 인증이 만료되었습니다. 다시 인증한 뒤 신청해주세요.',
  403: '신청 자격이 없거나 요청 검증에 실패했습니다. 새로고침 후 다시 시도하고, 계속되면 사전등록 상태를 확인해주세요.',
  404: '프로그램이나 신청서를 찾을 수 없습니다. 안내받은 링크를 다시 확인해주세요.',
  409: '이미 신청했거나, 정원이 마감됐거나, 신청서가 바뀌었습니다. 내 신청을 확인하고 신청서를 다시 불러온 뒤 시도해주세요.',
  502: '프로그램 신청 서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  503: '지금은 신청할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

/** 프로그램별 신청 결과. 201 본문의 status 가 확정·대기·처리 중을 알려 준다. */
export type ProgramApplyResult = 'CONFIRMED' | 'WAITING' | 'PROCESSING';

export const postProgramApplication = async (
  programType: ProgramType,
  expoId: string,
  programId: string,
  payload: unknown,
  csrfHeaders: Record<string, string>,
  idempotencyKey: string,
): Promise<ProgramApplyResult> => {
  const response = await submit(
    `/application/expos/${encodeURIComponent(expoId)}/program-sessions/${programType}/${encodeURIComponent(programId)}/applications`,
    payload,
    idempotencyKey,
    csrfHeaders,
    PROGRAM_APPLY_ERROR_MESSAGES,
  );
  const status = response.data?.status;
  return status === 'WAITING' || status === 'PROCESSING' ? status : 'CONFIRMED';
};
