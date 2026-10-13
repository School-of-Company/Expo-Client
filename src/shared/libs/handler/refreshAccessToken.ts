import { parseExpiresAt, setAuthCookies } from '../cookie/setAuthCookies';
import { serverInstance } from '../http/serverInstance';
import { RefreshTokenResult } from './type';

// 재발급 락 TTL(token.ts)보다 짧아야 한다
export const REFRESH_TIMEOUT_MS = 5_000;

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

    setAuthCookies({
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires: parseExpiresAt(accessTokenExpiresIn),
      refreshTokenExpires: parseExpiresAt(refreshTokenExpiresIn),
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch {
    return null;
  }
}
