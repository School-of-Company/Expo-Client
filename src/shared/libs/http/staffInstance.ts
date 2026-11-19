import axios, { InternalAxiosRequestConfig } from 'axios';
import { logProxyFailure } from './proxyFailureLog';
import { StaffSession } from './staffSession';

type RetriableConfig = InternalAxiosRequestConfig & { staffRetried?: boolean };

/**
 * 스태프 링크 화면용 요청 인스턴스. 관리자 쿠키 프록시(/api/server/token) 대신 스태프 프록시로 보내고
 * 메모리의 스태프 토큰을 싣는다. 401 이면 토큰을 새로 받아 한 번만 다시 보낸다(401 은 처리되지 않은 요청이다)
 */
export const createStaffInstance = (session: StaffSession) => {
  const instance = axios.create({ baseURL: '/api/server/staff' });

  instance.interceptors.request.use(async (config) => {
    config.headers.set('Authorization', `Bearer ${await session.getToken()}`);
    return config;
  });

  instance.interceptors.response.use(undefined, async (error) => {
    const config = (axios.isAxiosError(error) ? error.config : undefined) as
      | RetriableConfig
      | undefined;
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      config &&
      !config.staffRetried
    ) {
      session.invalidate();
      config.staffRetried = true;
      return instance.request(config);
    }
    return logProxyFailure(error);
  });

  return instance;
};
