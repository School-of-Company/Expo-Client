import { AxiosError, InternalAxiosRequestConfig } from 'axios';

const START_KEY = '__startedAt';

type TimedConfig = InternalAxiosRequestConfig & { [START_KEY]?: number };

// 쿼리에는 전화번호 같은 개인정보가 실릴 수 있어 경로까지만 남긴다
const toLoggableUrl = (uri: string) => {
  try {
    const { origin, pathname } = new URL(uri);
    return `${origin}${pathname}`;
  } catch {
    return uri.split('?')[0];
  }
};

export const markUpstreamStart = (config: InternalAxiosRequestConfig) => {
  (config as TimedConfig)[START_KEY] = Date.now();
  return config;
};

/**
 * Gateway 호출이 실패했을 때(응답 없음 또는 5xx) Vercel 로그에 한 줄로 남긴다.
 * 504 시각과 a.glink.kr/expo/... 원본 URL 을 Gateway·Apache 로그와 맞춰 보기 위한 용도
 */
export const logUpstreamFailure = (
  error: AxiosError,
  getUri: (config: InternalAxiosRequestConfig) => string,
) => {
  const status = error.response?.status;
  if (status !== undefined && status < 500) return;

  const config = error.config as TimedConfig | undefined;
  const startedAt = config?.[START_KEY];
  console.error(
    '[gateway-upstream-failure]',
    JSON.stringify({
      at: new Date(startedAt ?? Date.now()).toISOString(),
      method: config?.method?.toUpperCase(),
      url: config ? toLoggableUrl(getUri(config)) : undefined,
      status: status ?? null,
      elapsedMs: startedAt ? Date.now() - startedAt : undefined,
      timeoutMs: config?.timeout,
      code: error.code,
      message: error.message,
    }),
  );
};
