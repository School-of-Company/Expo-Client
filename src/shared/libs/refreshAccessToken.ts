import { setAuthCookies } from './cookie/setAuthCookies';
import { serverInstance } from './http/serverInstance';

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await serverInstance.patch('/auth', null, {
      headers: { RefreshToken: `Bearer ${refreshToken}` },
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
      accessTokenExpires: new Date(accessTokenExpiresIn),
      refreshTokenExpires: new Date(refreshTokenExpiresIn),
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    return null;
  }
}
