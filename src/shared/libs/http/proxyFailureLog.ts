import axios from 'axios';

const PROXY_FAILURE_STATUSES = [502, 504];

// 쿼리에는 전화번호 같은 개인정보가 실릴 수 있어 경로까지만 남긴다
const toLoggablePath = (url?: string) => url?.split('?')[0];

/**
 * 프록시가 Gateway 연결 실패(502)·응답 지연(504)을 돌려주면 브라우저 콘솔에 남긴다.
 * requestId 로 Vercel 로그의 [gateway-upstream-failure] 를 찾아 맞춰 볼 수 있다
 */
export const logProxyFailure = (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response &&
    PROXY_FAILURE_STATUSES.includes(error.response.status)
  ) {
    console.error(
      '[proxy-failure]',
      JSON.stringify({
        at: new Date().toISOString(),
        method: error.config?.method?.toUpperCase(),
        path: toLoggablePath(
          `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`,
        ),
        status: error.response.status,
        requestId: error.response.headers?.['x-vercel-id'],
      }),
    );
  }
  return Promise.reject(error);
};
