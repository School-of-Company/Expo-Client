// 토큰이 끝나기 전에 미리 새로 받는다. 스캔 도중 401 로 한 번 실패하는 일을 줄인다
const REFRESH_BEFORE_MS = 60 * 1000;
// exp 를 읽지 못하면 서버 상한(15분)보다 짧게 잡는다
const FALLBACK_LIFETIME_MS = 10 * 60 * 1000;

export interface StaffClaims {
  expoId: string;
  /** 초 단위 만료 시각. 없으면 null */
  exp: number | null;
}

/**
 * 스태프 토큰(JWT)의 본문에서 박람회 ID 와 만료 시각을 읽는다. 서명은 서버가 확인하므로 화면 이동에만 쓴다.
 * 토큰 응답에 박람회 ID 가 따로 없어서다(sub=staff:<inviteId>, expoId claim)
 */
export const readStaffClaims = (token: string): StaffClaims | null => {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)),
      ),
    ) as { expoId?: unknown; exp?: unknown };
    if (typeof json.expoId !== 'string' || !json.expoId) return null;
    return {
      expoId: json.expoId,
      exp: typeof json.exp === 'number' ? json.exp : null,
    };
  } catch {
    return null;
  }
};

/** 다시 받을 시각(ms). 끝나기 1분 전, exp 가 없으면 받은 뒤 10분 */
export const toRefreshAt = (exp: number | null, now: number) =>
  exp === null
    ? now + FALLBACK_LIFETIME_MS
    : Math.max(now, exp * 1000 - REFRESH_BEFORE_MS);
