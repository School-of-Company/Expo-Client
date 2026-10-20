const TOO_MANY_REQUESTS = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
const INVALID_INPUT = '입력값을 확인해주세요.';

/**
 * 서버가 한국어 문구를 주지 않을 때 상태별로 보여 줄 문구.
 * Gateway 가 직접 만든 오류("Not Found", "Bad Gateway", "Gateway Timeout" 등)와
 * 영문 ProblemDetail detail 이 그대로 화면에 나가지 않게 한다.
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: INVALID_INPUT,
  401: '로그인이 필요합니다. 다시 로그인해 주세요.',
  403: '이 작업을 할 권한이 없습니다.',
  404: '요청한 정보를 찾을 수 없습니다.',
  409: '다른 작업과 겹쳐 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  413: '기록이 너무 많아 한 번에 받을 수 없습니다. 날짜를 나눠서 받아 주세요.',
  422: '요청을 처리할 수 없습니다. 입력 내용을 확인해 주세요.',
  429: TOO_MANY_REQUESTS,
  500: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  502: '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  503: '서비스를 잠시 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  504: '서버 응답이 늦어 요청을 마치지 못했습니다. 잠시 후 다시 시도해 주세요.',
};

/** 상태별 한국어 문구. 모르는 상태면 undefined 라 호출한 쪽 대체 문구를 쓴다 */
export const toStatusMessage = (status: number): string | undefined =>
  STATUS_MESSAGES[status];

const HANGUL = /[ㄱ-ㆎ가-힣]/;

/**
 * 오류 본문에서 서버가 쓴 한국어 문구를 꺼낸다. 한글이 없는 영문 문구는 버린다.
 * - message: Nest·서비스 오류 본문
 * - detail: Spring ProblemDetail (Application 의 단체 문자·행정 이력 등)
 * - error: Next 프록시가 바꾼 { error, status } (토큰 재발급 뒤 재시도 응답만 원본이 온다)
 */
export const toKoreanServerText = (data: unknown): string | undefined => {
  const body =
    (data as
      | { message?: unknown; detail?: unknown; error?: unknown }
      | undefined) ?? {};
  return [body.message, body.detail, body.error].find(
    (value): value is string => typeof value === 'string' && HANGUL.test(value),
  );
};

/**
 * 서버 오류 본문({ message } 또는 ProblemDetail { detail })에서 화면에 보여 줄 문구를 꺼낸다.
 * - 검증 오류는 message 가 배열(영문 필드 오류)이라 공통 안내로 바꾼다.
 * - nestjs-zod 검증 오류(Form 서비스)는 message 가 "Validation failed" 이고 errors 에 zod issue 가 온다.
 *   서버가 직접 쓴 규칙 문구(code 'custom', 한국어)가 있으면 그걸, 없으면 공통 안내를 보여 준다.
 * - 한국어 문구가 없으면(Gateway 의 "Bad Gateway", 429 "ThrottlerException: ..." 등) 상태별 문구로 바꾼다.
 *   서비스가 준 한국어 429 문구는 그대로 둔다.
 */
export const toServerMessage = (
  status: number,
  data: unknown,
): string | undefined => {
  const { message, errors } =
    (data as { message?: unknown; errors?: unknown } | undefined) ?? {};
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
  return toKoreanServerText(data) ?? toStatusMessage(status);
};

/** 서버 오류 본문의 `code`(예: FORM_NOT_FOUND). 화면이 코드로 문구를 고를 수 있게 그대로 넘긴다. */
export const toServerCode = (data: unknown): string | undefined => {
  const code = (data as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' ? code : undefined;
};

/** 프로그램 신청 거부(403·409)의 `ineligibleReason`. 화면이 포괄 오류 대신 사유 문구를 고를 수 있게 넘긴다. */
export const toServerIneligibleReason = (data: unknown): string | undefined => {
  const reason = (data as { ineligibleReason?: unknown } | undefined)
    ?.ineligibleReason;
  return typeof reason === 'string' ? reason : undefined;
};

/**
 * User 서비스 검증 오류의 `errors`({ 필드명: 사유 }). 화면이 필드마다 사유를 보여 줄 수 있게 넘긴다.
 * Form 서비스의 zod issue 배열이나 문자열이 아닌 값은 버린다.
 */
export const toServerFieldErrors = (
  data: unknown,
): Record<string, string> | undefined => {
  const errors = (data as { errors?: unknown } | undefined)?.errors;
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
    return undefined;
  }
  const entries = Object.entries(errors).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
};
