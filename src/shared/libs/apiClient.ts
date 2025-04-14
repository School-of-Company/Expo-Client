import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { clearAuthCookies } from './clearAuthCookies';
import { setAuthCookies } from './setAuthCookies';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._isRetry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest!._isRetry = true;

        try {
          const refreshToken = cookies().get('refreshToken')?.value;
          const { data } = await axios.patch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth`,
            {},
            { headers: { RefreshToken: `Bearer ${refreshToken}` } },
          );

          setAuthCookies(data);

          originalRequest!.headers = originalRequest!.headers || {};
          originalRequest!.headers.Authorization = `Bearer ${data.accessToken}`;

          refreshSubscribers.forEach((cb) => cb(data.accessToken));
          refreshSubscribers = [];

          return apiClient(originalRequest!);
        } catch (refreshError) {
          clearAuthCookies();

          throw new Error('세션이 만료되었습니다. 다시 로그인해 주세요.');
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, _reject) => {
        refreshSubscribers.push((newToken: string) => {
          originalRequest!.headers = originalRequest!.headers || {};
          originalRequest!.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest!));
        });
      });
    }

    return Promise.reject(error);
  },
);
