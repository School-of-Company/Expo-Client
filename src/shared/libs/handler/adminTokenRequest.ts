import { isAxiosError } from 'axios';
import { cookies } from 'next/headers';
import { performTokenRefresh } from './token';

/** 액세스 토큰이 없고 재발급도 할 수 없을 때. 다시 로그인해야 한다 */
export class AuthExpiredError extends Error {
  constructor() {
    super('로그인이 만료되었습니다. 다시 로그인해주세요.');
    this.name = 'AuthExpiredError';
  }
}

/**
 * 관리자 토큰으로 서버를 호출한다. 액세스 토큰 쿠키가 만료되어 없거나 서버가 401을 주면
 * 리프레시 토큰으로 재발급(쿠키 갱신 포함)한 뒤 한 번 더 시도한다.
 */
export async function callWithAdminToken<T>(
  call: (accessToken: string) => Promise<T>,
): Promise<T> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (accessToken) {
    try {
      return await call(accessToken);
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) throw error;
    }
  }

  if (!refreshToken) throw new AuthExpiredError();
  const tokens = await performTokenRefresh(refreshToken);
  if (!tokens) throw new AuthExpiredError();
  return call(tokens.accessToken);
}
