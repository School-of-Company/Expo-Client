export const PASSWORD_PATTERN = {
  value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/,
  message:
    '비밀번호는 8자리 이상, 대문자 1개, 특수문자 1개 이상을 포함해야 합니다.',
};

export const DATE_TIME_PATTERN = {
  value:
    /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d)$/,
  message: 'yyyy-mm-dd HH:mm 형식으로 입력해주세요',
};

export const PHONE_NUMBER_PATTERN = {
  value: /^\d{10,11}$/,
  message: '유효한 전화번호를 입력해주세요.',
};

export const SMS_CODE_PATTERN = {
  value: /^\d{6}$/,
  message: '6자리 숫자를 입력해주세요.',
};
