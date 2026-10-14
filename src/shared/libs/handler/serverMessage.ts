const TOO_MANY_REQUESTS = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
const INVALID_INPUT = '입력값을 확인해주세요.';

/**
 * 서버 오류 본문({ message })에서 화면에 보여 줄 문구를 꺼낸다.
 * - 검증 오류는 message 가 배열(영문 필드 오류)이라 공통 안내로 바꾼다.
 * - nestjs-zod 검증 오류(Form 서비스)는 message 가 "Validation failed" 이고 errors 에 zod issue 가 온다.
 *   서버가 직접 쓴 규칙 문구(code 'custom', 한국어)가 있으면 그걸, 없으면 공통 안내를 보여 준다.
 * - Application 서버는 ProblemDetail({ detail }) 로 답한다. 한국어 detail 만 그대로 보여 주고 영문 detail 은 버린다.
 * - Gateway 의 요청 제한 429 는 "ThrottlerException: ..." 영문이라 바꾸고, 서비스가 준 한국어 429 문구는 그대로 둔다.
 */
export const toServerMessage = (
  status: number,
  data: unknown,
): string | undefined => {
  const { message, errors, detail } =
    (data as
      | { message?: unknown; errors?: unknown; detail?: unknown }
      | undefined) ?? {};
  if (Array.isArray(message)) return INVALID_INPUT;
  if (message === 'Validation failed') {
    const custom = Array.isArray(errors)
      ? errors.find(
          (issue) =>
            issue?.code === 'custom' && typeof issue.message === 'string',
        )
      : undefined;
    return custom?.message || INVALID_INPUT;
  }
  if (typeof message !== 'string' || !message) {
    if (typeof detail === 'string' && /[가-힣]/.test(detail)) return detail;
    return status === 429 ? TOO_MANY_REQUESTS : undefined;
  }
  if (message.startsWith('ThrottlerException')) return TOO_MANY_REQUESTS;
  return message;
};

/** 서버 오류 본문의 `code`(예: FORM_NOT_FOUND). 화면이 코드로 문구를 고를 수 있게 그대로 넘긴다. */
export const toServerCode = (data: unknown): string | undefined => {
  const code = (data as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' ? code : undefined;
};
