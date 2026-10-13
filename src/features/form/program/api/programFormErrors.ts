import { ApiError, toApiError } from '@/shared/libs/http/apiError';

/** Form 서비스가 프로그램용 폼에서 내려주는 오류 코드(Expo-Form-Server#102, #113). */
export const PROGRAM_FORM_ERROR_MESSAGES: Record<string, string> = {
  FORM_VERSION_CONFLICT:
    '다른 관리자가 먼저 수정했습니다. 최신 폼을 다시 불러온 뒤 수정해주세요.',
  PROGRAM_FORM_TITLE_DUPLICATED:
    '같은 제목의 프로그램용 폼이 이미 있습니다. 제목을 바꿔주세요.',
  PROGRAM_FORM_PROTECTION_PENDING:
    '회차 사용 여부 보호가 연결될 때까지 폼 삭제와 기간 줄이기는 할 수 없습니다.',
  FORM_NOT_FOUND: '폼을 찾을 수 없습니다.',
};

/** 응답의 오류 코드를 사람이 읽을 문구로 바꾼다. 코드는 ApiError.code 로 남겨 화면이 분기한다. */
export const toProgramFormError = (error: unknown, fallback: string): Error => {
  const apiError = toApiError(error, fallback);
  if (!(apiError instanceof ApiError)) {
    return apiError instanceof Error ? apiError : new Error(fallback);
  }

  const known = apiError.code && PROGRAM_FORM_ERROR_MESSAGES[apiError.code];
  return known ? new ApiError(known, apiError.status, apiError.code) : apiError;
};
