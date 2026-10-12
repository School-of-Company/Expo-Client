import axios from 'axios';

const clientTokenInstance = axios.create({
  baseURL: '/api/server/token',
  withCredentials: true,
});

/**
 * 프록시가 토큰 갱신 실패로 돌려준 401인지 본다.
 * responseType: 'blob' 요청은 오류 본문도 Blob 이라 JSON 으로 풀어 읽고, 못 읽으면 401 자체를 갱신 실패로 본다
 */
const isRefreshFailure = async (data: unknown) => {
  if (data instanceof Blob) {
    try {
      return !!JSON.parse(await data.text())?.isRefreshError;
    } catch {
      return true;
    }
  }
  return !!(data as { isRefreshError?: boolean } | undefined)?.isRefreshError;
};

clientTokenInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (await isRefreshFailure(error.response.data))
    ) {
      if (config?.skipAuthRedirect) {
        return Promise.reject(error);
      }

      window.location.href = '/signin';
      return;
    }

    return Promise.reject(error);
  },
);

export default clientTokenInstance;
