const PHONE_MAX_DIGITS = 11;

/**
 * 붙여넣은 `010-1234-5678`, `+82 10-1234-5678` 을 숫자 11자리로 맞춘다.
 * 입력창 maxLength 는 하이픈을 지우기 전에 잘라 버리므로 쓰지 않고 여기서 자른다
 */
export const normalizePhoneInput = (value: string) => {
  const raw = value.trim();
  let digits = raw.replace(/[^0-9]/g, '');
  if (/^(\+|00)82/.test(raw)) {
    digits = digits.replace(/^(00)?82/, '');
    if (digits && !digits.startsWith('0')) digits = `0${digits}`;
  }
  return digits.slice(0, PHONE_MAX_DIGITS);
};
