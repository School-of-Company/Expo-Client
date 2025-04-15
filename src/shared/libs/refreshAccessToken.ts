import { apiClient } from './apiClient';
import { setAuthCookies } from './setAuthCookies';

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await apiClient.patch('/auth', null, {
      headers: { RefreshToken: `Bearer ${refreshToken}` },
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setAuthCookies(accessToken, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    return null;
  }
}
