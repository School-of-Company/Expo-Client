import axios from 'axios';
import { ApiError } from '@/shared/libs/http/apiError';

/** Form 서버 오류 본문. 프록시를 거치면 `{ error, status, code }`로 온다. */
export interface ErrorResponseDto {
  code: string;
  message: string;
}

/** Form 서버 `ErrorResponseDto.code` → 화면 문구. 폼·프로그램폼·설문 공통. */
export const FORM_ERROR_MESSAGES: Record<string, string> = {
  FORM_NOT_FOUND: '폼을 찾을 수 없습니다.',
  FORM_ALREADY_EXISTS: '같은 참여자군·신청방식의 폼이 이미 있습니다.',
  FORM_VERSION_CONFLICT:
    '다른 관리자가 먼저 수정했습니다. 최신 폼을 다시 불러온 뒤 수정해주세요.',
  PROGRAM_FORM_TITLE_DUPLICATED:
    '같은 제목의 프로그램용 폼이 이미 있습니다. 제목을 바꿔주세요.',
  PROGRAM_FORM_PROTECTION_PENDING:
    '회차 사용 여부 보호가 연결될 때까지 폼 삭제와 기간 줄이기는 할 수 없습니다.',
  SURVEY_NOT_FOUND: '만족도 조사를 찾을 수 없습니다.',
  SURVEY_ALREADY_EXISTS: '같은 참여자군의 만족도 조사가 이미 있습니다.',
  SURVEY_ANSWER_INVALID: '답변을 다시 확인해주세요.',
  SURVEY_ANSWER_ALREADY_EXISTS: '이미 만족도 조사에 응답했습니다.',
  PARTICIPANT_NOT_FOUND: '이 전화번호로 등록된 참가자를 찾을 수 없습니다.',
  PARTICIPANT_AMBIGUOUS:
    '이 전화번호로 등록된 참가자가 여러 명이라 확인할 수 없습니다. 운영진에게 문의해주세요.',
  EXPO_NOT_FOUND: '박람회를 찾을 수 없습니다.',
  EXPO_DELETED: '삭제된 박람회입니다.',
  EXTERNAL_SERVICE_UNAVAILABLE:
    '일시적으로 처리할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * axios 오류를 화면 문구가 담긴 ApiError로 바꾼다.
 * 아는 코드면 매핑 문구, 모르면 서버 문구, 그것도 없으면 `fallback`을 쓴다.
 */
export const toFormError = (error: unknown, fallback: string): Error => {
  if (!axios.isAxiosError(error) || !error.response) {
    return error instanceof Error ? error : new Error(fallback);
  }

  const { status, data } = error.response;
  const code: string | undefined = data?.code;
  const known = code && FORM_ERROR_MESSAGES[code];
  const message = known || data?.error || data?.message;

  return new ApiError(
    typeof message === 'string' && message ? message : fallback,
    status,
    code,
  );
};

/** 요청 결과의 `data`를 꺼내고, 실패하면 `toFormError`로 바꿔 던진다. */
export const formRequest = async <T>(
  request: Promise<{ data: T }>,
  fallback: string,
): Promise<T> => {
  try {
    return (await request).data;
  } catch (error) {
    throw toFormError(error, fallback);
  }
};
