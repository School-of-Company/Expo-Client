import { AxiosError } from 'axios';
import { refreshAccessToken } from '@/shared/libs/handler/refreshAccessToken';
import { retryRequest } from './request';
import { GlobalRefreshState, RefreshTokenResult } from './type';

export const globalForRefresh: GlobalRefreshState = {
  refreshTokenPromise: null,
  isRefreshing: false,
  lastRefreshTime: 0,
  waitingRequests: [],
};

export async function performTokenRefresh(
  refreshToken: string,
): Promise<RefreshTokenResult | null> {
  const now = Date.now();

  if (
    globalForRefresh.cachedTokens &&
    globalForRefresh.cachedTokens.expiresAt > now
  ) {
    return {
      accessToken: globalForRefresh.cachedTokens.accessToken,
      refreshToken: globalForRefresh.cachedTokens.refreshToken,
    };
  }

  if (globalForRefresh.isRefreshing && globalForRefresh.refreshTokenPromise) {
    return await globalForRefresh.refreshTokenPromise;
  }

  try {
    globalForRefresh.lastRefreshTime = now;
    globalForRefresh.isRefreshing = true;
    globalForRefresh.refreshTokenPromise = refreshAccessToken(refreshToken);

    const result = await globalForRefresh.refreshTokenPromise;
    if (result) {
      globalForRefresh.cachedTokens = {
        ...result,
        expiresAt: Date.now() + 1000,
      };
      await processWaitingRequests(result.accessToken);
    }
    return result;
  } catch (error) {
    rejectWaitingRequests(error as AxiosError);
    return null;
  } finally {
    globalForRefresh.isRefreshing = false;
    globalForRefresh.refreshTokenPromise = null;
  }
}

export async function processWaitingRequests(accessToken: string) {
  const waitingRequests = [...globalForRefresh.waitingRequests];
  globalForRefresh.waitingRequests = [];

  for (const { resolve, reject, req, originalBody } of waitingRequests) {
    try {
      const response = await retryRequest(req, accessToken, originalBody);
      resolve(response);
    } catch (error) {
      reject(error as AxiosError);
    }
  }
}

export function rejectWaitingRequests(error: AxiosError) {
  const waitingRequests = [...globalForRefresh.waitingRequests];
  globalForRefresh.waitingRequests = [];

  for (const { reject } of waitingRequests) {
    reject(error);
  }
}
