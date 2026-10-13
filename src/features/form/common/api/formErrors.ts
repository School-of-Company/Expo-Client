import axios from 'axios';
import { ApiError } from '@/shared/libs/http/apiError';

/** Form 서비스가 박람회 폼·설문에서 내려주는 오류 코드(ErrorResponseDto.code). */
export const FORM_ERROR_MESSAGES: Record<string, string> = {
  FORM_ALREADY_EXISTS:
    '이 참가자 유형과 신청 방식의 폼이 이미 있습니다. 새로고침 후 기존 폼을 수정해주세요.',
  FORM_NOT_FOUND: '폼을 찾을 수 없습니다.',
  SURVEY_ALREADY_EXISTS:
    '이 참가자 유형의 만족도 조사가 이미 있습니다. 새로고침 후 기존 조사를 수정해주세요.',
  SURVEY_NOT_FOUND: '만족도 조사를 찾을 수 없습니다.',
  EXPO_NOT_FOUND: '박람회를 찾을 수 없습니다.',
  EXPO_DELETED: '삭제된 박람회입니다.',
  EXTERNAL_SERVICE_UNAVAILABLE:
    '박람회 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.',
};

/** 오류 코드를 문구로 바꾸고 응답 상태를 남긴다. 코드를 모르면 서버 문구를 그대로 쓴다. */
export const toFormError = (error: unknown, fallback: string): unknown => {
  if (!axios.isAxiosError(error) || !error.response) return error;

  const { status, data } = error.response;
  const known = data?.code && FORM_ERROR_MESSAGES[data.code];

  return new ApiError(
    known || data?.error || data?.message || fallback,
    status,
  );
};
