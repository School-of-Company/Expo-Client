import axios from 'axios';
import { ApiError, toApiError } from './apiError';
import clientInstance from './clientInstance';
import { readStaffClaims, toRefreshAt } from './staffSessionClaims';

export const STAFF_LINK_INVALID_MESSAGE =
  '스태프 링크가 만료되었거나 회수되었습니다. 운영진에게 새 링크를 받아 주세요.';

interface StaffTokenResponse {
  accessToken: string;
  accessTokenExpiresIn: string;
}

// 링크가 만료·회수됐거나 없는 비밀값이면 User 가 401, Expo 가 403·404 를 준다
const isInvalidLink = (status: number | undefined) =>
  status === 401 || status === 403 || status === 404;

/**
 * 링크 비밀값으로 스태프 토큰을 받아 메모리에만 둔다. 새로고침 토큰은 없어서 끝나 가면 같은 비밀값으로 다시 받는다.
 * 저장소(localStorage·쿠키)에 남기지 않아 탭을 닫으면 사라진다
 */
export const createStaffSession = (secret: string) => {
  let current: { token: string; expoId: string; refreshAt: number } | null =
    null;
  let pending: Promise<{ token: string; expoId: string }> | null = null;

  const exchange = async () => {
    try {
      const { data } = await clientInstance.post<StaffTokenResponse>(
        '/staff-auth',
        { secret },
      );
      const claims = readStaffClaims(data.accessToken);
      if (!claims) throw new ApiError(STAFF_LINK_INVALID_MESSAGE, 401);
      current = {
        token: data.accessToken,
        expoId: claims.expoId,
        refreshAt: toRefreshAt(claims.exp, Date.now()),
      };
      return current;
    } catch (error) {
      current = null;
      if (error instanceof ApiError) throw error;
      if (axios.isAxiosError(error) && isInvalidLink(error.response?.status)) {
        throw new ApiError(STAFF_LINK_INVALID_MESSAGE, error.response!.status);
      }
      throw toApiError(error, '스태프 링크를 확인하지 못했습니다.');
    }
  };

  const ensure = () => {
    if (current && Date.now() < current.refreshAt) {
      return Promise.resolve(current);
    }
    pending ??= exchange().finally(() => {
      pending = null;
    });
    return pending;
  };

  return {
    /** 토큰을 받거나 끝나 가면 새로 받는다. 박람회 ID 도 함께 준다 */
    ensure,
    getToken: async () => (await ensure()).token,
    /** 서버가 401 을 주면 다음 요청에서 새로 받게 한다 */
    invalidate: () => {
      current = null;
    },
  };
};

export type StaffSession = ReturnType<typeof createStaffSession>;
