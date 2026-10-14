// User 서버 SignUpReqDto 와 같은 규칙
export const PASSWORD_PATTERN = {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,24}$/,
  message:
    '비밀번호는 8~24자이며 영문 대문자·소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
};

export const DATE_TIME_PATTERN = {
  value:
    /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d)$/,
  message: 'yyyy-mm-dd HH:mm 형식으로 입력해주세요',
};

// User·Notification 서버와 같은 규칙: 01 로 시작하는 휴대폰 번호, 하이픈 없이
export const PHONE_NUMBER_PATTERN = {
  value: /^01\d{8,9}$/,
  message: '휴대폰 번호를 - 없이 입력해주세요. (예: 01012345678)',
};

// 서버가 보내는 인증번호는 4자리
export const SMS_CODE_PATTERN = {
  value: /^\d{4}$/,
  message: '4자리 숫자를 입력해주세요.',
};

// Expo 서버 프로그램·사전등록 회차 요청의 @CodePointLength(max = 50) 와 같은 규칙.
// 이모지처럼 UTF-16 두 칸을 쓰는 문자도 한 글자로 세야 하므로 length 대신 Array.from 으로 코드 포인트 수를 센다
export const PROGRAM_TITLE_MAX_LENGTH = 50;

export const isProgramTitleTooLong = (title: string) =>
  Array.from(title).length > PROGRAM_TITLE_MAX_LENGTH;

// Expo 서버 프로그램 요청은 시작이 종료보다 빨라야 한다 (같으면 400).
// 두 값이 모두 'yyyy-MM-dd HH:mm' 형식일 때만 비교하고, 형식 오류는 DATE_TIME_PATTERN 이 따로 알려준다.
// 자릿수가 고정된 형식이라 문자열 비교가 곧 시간순 비교다
export const isDateTimeRangeInvalid = (startedAt: string, endedAt: string) =>
  DATE_TIME_PATTERN.value.test(startedAt) &&
  DATE_TIME_PATTERN.value.test(endedAt) &&
  startedAt >= endedAt;
