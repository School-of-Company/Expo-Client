import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { apiClient } from './apiClient';

interface TokenResponse {
  newAuthorization: string;
}

export async function getRefresh(
  err: AxiosError,
): Promise<AxiosResponse | Promise<never>> {
  const originalRequest = err.config as AxiosRequestConfig & {
    _retry?: boolean;
  };

  if (err.response && err.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const Router = useRouter();
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        Router.push('/signin');
        return Promise.reject(new Error('No refresh token found'));
      }

      const tokenResponse = await axios.patch<TokenResponse>(
        '/api/auth/tokenReissue',
        null,
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      );

      if (tokenResponse.data && tokenResponse.data.newAuthorization) {
        localStorage.setItem(
          'accessToken',
          tokenResponse.data.newAuthorization,
        );
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] =
          'Bearer ' + tokenResponse.data.newAuthorization;

        return apiClient(originalRequest);
      }
    } catch (refreshError) {
      Router.push('/signin');
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(err);
}
