// 박람회마다 따로 저장해 다른 박람회 토큰이 섞이지 않게 한다. 응답 토큰만 저장한다
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

/** 완료 상태를 읽을 수 있는 응답인지. claimed 가 true 일 때만 완료로 본다 */
export const isPickupDone = (status: { claimed?: boolean } | undefined) =>
  status?.claimed === true;
