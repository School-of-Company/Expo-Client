const TOO_MANY_REQUESTS = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
const INVALID_INPUT = '입력값을 확인해주세요.';

/**
 * 서버 오류 본문({ message })에서 화면에 보여 줄 문구를 꺼낸다.
 * - 검증 오류는 message 가 배열(영문 필드 오류)이라 공통 안내로 바꾼다.
 * - Gateway 의 요청 제한 429 는 "ThrottlerException: ..." 영문이라 바꾸고, 서비스가 준 한국어 429 문구는 그대로 둔다.
 */
export const toServerMessage = (
  status: number,
  data: unknown,
): string | undefined => {
  const message = (data as { message?: unknown } | undefined)?.message;
  if (Array.isArray(message)) return INVALID_INPUT;
  if (typeof message !== 'string' || !message) {
    return status === 429 ? TOO_MANY_REQUESTS : undefined;
  }
  if (message.startsWith('ThrottlerException')) return TOO_MANY_REQUESTS;
  return message;
};
