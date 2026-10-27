// 직원 PIN은 숫자 4~8자리다(Expo-Form-Server 계약). 정답 비교는 서버가 하고 여기서는 형식만 본다
export const STAFF_PIN_MIN = 4;
export const STAFF_PIN_MAX = 8;

export const keepDigits = (value: string) =>
  value.replace(/\D/g, '').slice(0, STAFF_PIN_MAX);

export const isValidStaffPin = (value: string) =>
  new RegExp(`^\\d{${STAFF_PIN_MIN},${STAFF_PIN_MAX}}$`).test(value);

// 박람회마다 따로 저장해 다른 박람회 토큰이 섞이지 않게 한다. 토큰만 저장하고 PIN은 저장하지 않는다
export const giftTokenStorageKey = (expoId: string) =>
  `surveyGiftToken:${expoId}`;

export const loadGiftToken = (expoId: string): string | null => {
  try {
    const token = localStorage.getItem(giftTokenStorageKey(expoId));
    return token && token.trim() ? token : null;
  } catch {
    // 저장소를 쓸 수 없으면 토큰을 복구할 수 없다. 가짜 상태를 만들지 않고 호출부가 안내한다
    return null;
  }
};

export const saveGiftToken = (expoId: string, token: string) => {
  try {
    localStorage.setItem(giftTokenStorageKey(expoId), token);
  } catch {
    // 저장하지 못해도 이번 화면에서는 쓴다
  }
};

export const clearGiftToken = (expoId: string) => {
  try {
    localStorage.removeItem(giftTokenStorageKey(expoId));
  } catch {
    // 지우지 못해도 다음 조회가 잘못된 토큰으로 안내한다
  }
};

export interface PinFailure {
  status?: number;
  code?: string;
  message: string;
  attemptsLeft?: number;
  retryAfterSeconds?: number;
}

export type PinFailureNotice =
  | { kind: 'WRONG'; text: string }
  | { kind: 'LOCKED'; text: string; retryAfterSeconds: number }
  | { kind: 'TOKEN_INVALID'; text: string }
  | { kind: 'OTHER'; text: string };

/** 서버가 준 오류 코드로 PIN 입력 창에 보일 안내를 정한다. 코드를 모르면 서버 문구를 그대로 보인다 */
export const toPinFailureNotice = (failure: PinFailure): PinFailureNotice => {
  switch (failure.code) {
    case 'GIFT_PIN_INVALID':
      return {
        kind: 'WRONG',
        text:
          failure.attemptsLeft !== undefined
            ? `PIN이 맞지 않습니다. ${failure.attemptsLeft}번 더 틀리면 잠시 잠깁니다.`
            : 'PIN이 맞지 않습니다.',
      };
    case 'GIFT_PIN_LOCKED': {
      const seconds = failure.retryAfterSeconds ?? 0;
      return {
        kind: 'LOCKED',
        retryAfterSeconds: seconds,
        text: `PIN을 여러 번 틀려 잠겼습니다. ${seconds}초 뒤 다시 입력해 주세요.`,
      };
    }
    case 'GIFT_PICKUP_TOKEN_INVALID':
      return { kind: 'TOKEN_INVALID', text: failure.message };
    default:
      return { kind: 'OTHER', text: failure.message };
  }
};

/** 잠금 해제까지 남은 초. 해제 시각이 지났으면 0 */
export const remainingLockSeconds = (
  lockedUntil: number | null,
  now: number,
) =>
  lockedUntil === null ? 0 : Math.max(0, Math.ceil((lockedUntil - now) / 1000));
