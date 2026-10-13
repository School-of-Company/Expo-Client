import axios from 'axios';

/** Form 서비스가 설문 답변 제출에서 내려주는 오류 코드. */
export const SURVEY_ANSWER_ERROR_MESSAGES: Record<string, string> = {
  SURVEY_ANSWER_ALREADY_EXISTS: '이미 만족도 조사에 응답하셨습니다.',
  PARTICIPANT_NOT_FOUND:
    '이 전화번호로 등록된 참가자를 찾을 수 없습니다. 박람회 등록에 쓴 번호인지 확인해주세요.',
  PARTICIPANT_AMBIGUOUS:
    '이 전화번호로 등록된 참가자가 여러 명이라 응답자를 확인할 수 없습니다. 현장 운영 요원에게 문의해주세요.',
  SURVEY_ANSWER_INVALID: '입력한 답변을 다시 확인해주세요.',
  SURVEY_NOT_FOUND: '진행 중인 만족도 조사가 없습니다.',
  EXTERNAL_SERVICE_UNAVAILABLE:
    '응답자를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.',
};

/** 응답의 오류 코드를 사람이 읽을 문구로 바꾼다. 코드를 모르면 서버 문구를 그대로 쓴다. */
export const toSurveyAnswerError = (
  error: unknown,
  fallback: string,
): Error => {
  if (!axios.isAxiosError(error) || !error.response) {
    return error instanceof Error ? error : new Error(fallback);
  }

  const body = error.response.data;
  const known = body?.code && SURVEY_ANSWER_ERROR_MESSAGES[body.code];

  return new Error(known || body?.error || body?.message || fallback);
};
