import { apiClient } from './apiClient';
import { setAuthCookies } from './setAuthCookies';

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await apiClient.patch('/auth', null, {
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
