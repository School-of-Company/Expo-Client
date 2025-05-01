import { setAuthCookies } from '../cookie/setAuthCookies';
import { serverInstance } from '../http/serverInstance';

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

    const accessTokenExpires = new Date(accessTokenExpiresIn + 'Z');
    const refreshTokenExpires = new Date(refreshTokenExpiresIn + 'Z');

    setAuthCookies({
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires,
      refreshTokenExpires,
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    return null;
  }
}
