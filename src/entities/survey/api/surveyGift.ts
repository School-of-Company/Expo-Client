import axios from 'axios';
import { toFormError } from '@/entities/form/lib/errors';
import { ApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import type { GiftPickupStatusDto } from '../model/types';

/** Form 서버 직원확인 오류 코드 → 화면 문구 */
const GIFT_ERROR_MESSAGES: Record<string, string> = {
  GIFT_PICKUP_TOKEN_INVALID:
    '확인 정보를 찾을 수 없습니다. 운영진에게 문의해 주세요.',
};

// Gateway가 공개 경로로 열지 않았거나 서버가 막으면 401이 온다. 참가자에게 로그인을 안내하지 않는다
const UNAVAILABLE =
  '지금은 직원확인을 할 수 없습니다. 운영진에게 문의해 주세요.';

const NETWORK_ERROR = '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';

const toGiftError = (error: unknown, fallback: string): Error => {
  // 응답을 받지 못한 오류는 영문 기본 문구("Network Error") 대신 한국어 안내를 보인다
  if (axios.isAxiosError(error) && !error.response)
    return new Error(NETWORK_ERROR);
  const base = toFormError(error, fallback);
  if (!(base instanceof ApiError)) return base;
  if (axios.isAxiosError(error) && base.status === 401)
    return new ApiError(UNAVAILABLE, 401, base.code);
  return new ApiError(
    GIFT_ERROR_MESSAGES[base.code ?? ''] ?? base.message,
    base.status,
    base.code,
  );
};

/** 응답 토큰은 URL 쿼리가 아니라 바디로만 보낸다. 응답은 no-store 다 */
export const getGiftPickupStatus = async (expoId: string, token: string) => {
  try {
    const { data } = await clientInstance.post<GiftPickupStatusDto>(
      `/surveys/${encodeURIComponent(expoId)}/gift-pickup/status`,
      { token },
    );
    return data;
  } catch (error) {
    throw toGiftError(error, '직원확인 상태를 불러오지 못했습니다.');
  }
};

/**
 * 직원확인을 완료로 저장한다. 직원 PIN은 쓰지 않고 응답 토큰만 보낸다(Expo-Form-Server#267).
 * 이미 완료된 토큰은 같은 완료 상태를 돌려준다(멱등)
 */
export const confirmGiftPickup = async (expoId: string, token: string) => {
  try {
    const { data } = await clientInstance.post<GiftPickupStatusDto>(
      `/surveys/${encodeURIComponent(expoId)}/gift-pickup/confirm`,
      { token },
    );
    return data;
  } catch (error) {
    throw toGiftError(error, '직원확인을 완료하지 못했습니다.');
  }
};
