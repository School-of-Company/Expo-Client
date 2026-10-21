import { isAxiosError } from 'axios';
import { parseExpiresAt, setAuthCookies } from '../cookie/setAuthCookies';
import { serverInstance } from '../http/serverInstance';
import { RefreshTokenResult } from './type';

// 재발급 락 TTL(token.ts)보다 짧아야 한다
export const REFRESH_TIMEOUT_MS = 5_000;

/** 네트워크 오류·5xx 등 일시적 실패. refresh token 이 무효라는 뜻이 아니므로 로그아웃하지 않는다 */
export class RefreshUnavailableError extends Error {
  constructor() {
    super(
      '토큰 재발급을 일시적으로 할 수 없습니다. 잠시 후 다시 시도해주세요.',
    );
    this.name = 'RefreshUnavailableError';
  }
}

/** refresh token 이 무효(401)면 null, 그 외 실패는 RefreshUnavailableError 를 던진다 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshTokenResult | null> {
  try {
    const response = await serverInstance.patch('/auth', null, {
      headers: { RefreshToken: `Bearer ${refreshToken}` },
      timeout: REFRESH_TIMEOUT_MS,
    });

    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    } = response.data;

    const accessTokenExpires = parseExpiresAt(accessTokenExpiresIn);
    const refreshTokenExpires = parseExpiresAt(refreshTokenExpiresIn);
    setAuthCookies({
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires,
      refreshTokenExpires,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires: accessTokenExpires?.toISOString(),
      refreshTokenExpires: refreshTokenExpires?.toISOString(),
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw new RefreshUnavailableError();
  }
}
