import { isAxiosError } from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

export const RETRIED_KEY = '__retried';

// 응답 없이 연결이 끊기거나 시간이 지난 네트워크 계열 오류. 서버가 응답한 4xx·5xx 는 포함하지 않는다
const RETRYABLE_CODES = new Set(['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET']);
export const RETRY_DELAY_MS = 300;

type RetriedConfig = InternalAxiosRequestConfig & { [RETRIED_KEY]?: boolean };

export const isRetried = (config?: InternalAxiosRequestConfig) =>
  Boolean((config as RetriedConfig | undefined)?.[RETRIED_KEY]);

/**
 * 한 번 더 보낼 오류인지. GET 만 다시 보낸다(쓰기 요청은 서버가 처리했는지 알 수 없다).
 * 기본 timeout 이 아닌 요청(엑셀 다운로드는 서버가 파일을 만드는 중이라 다시 보내면 생성이 두 번 돈다)은 제외한다
 */
export const shouldRetry = (error: unknown, defaultTimeoutMs: number) => {
  if (!isAxiosError(error)) return false;
  const { config } = error;
  return (
    !!config &&
    !error.response &&
    config.method?.toLowerCase() === 'get' &&
    config.timeout === defaultTimeoutMs &&
    !isRetried(config) &&
    RETRYABLE_CODES.has(error.code ?? '')
  );
};

/**
 * Gateway 로 가는 일반 GET 이 네트워크 오류로 실패하면 300ms 뒤 한 번 더 보낸다.
 * 실패 로그를 남기는 인터셉터보다 뒤에 걸어 시도마다 로그가 남게 한다
 */
export const retryOnNetworkError = (
  instance: AxiosInstance,
  defaultTimeoutMs: number,
) => {
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    if (!shouldRetry(error, defaultTimeoutMs)) throw error;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return instance.request({
      ...error.config,
      [RETRIED_KEY]: true,
    } as RetriedConfig);
  });
};
