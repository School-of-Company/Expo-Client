import axios from 'axios';
import { toFormError } from '@/entities/form/lib/errors';
import { ApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import type { GiftPickupStatusDto, GiftPinStatusDto } from '../model/types';

/** Form 서버 기념품 수령 오류 코드 → 화면 문구. PIN 오류와 잠금은 남은 횟수·초를 화면이 덧붙인다 */
const GIFT_ERROR_MESSAGES: Record<string, string> = {
  GIFT_PIN_INVALID: 'PIN이 맞지 않습니다.',
  GIFT_PICKUP_TOKEN_INVALID:
    '수령 정보를 찾을 수 없습니다. 운영진에게 문의해 주세요.',
  GIFT_PIN_NOT_CONFIGURED:
    '이 박람회에 직원 PIN이 설정되지 않았습니다. 운영진에게 PIN 설정을 요청해 주세요.',
  GIFT_PIN_LOCKED: 'PIN을 여러 번 틀려 잠시 잠겼습니다.',
};

/** 수령 확인 실패. PIN 오류(403)의 남은 횟수와 잠금(429)의 해제까지 초를 함께 가진다 */
export class GiftPickupError extends ApiError {
  constructor(
    message: string,
    status: number,
    code?: string,
    readonly attemptsLeft?: number,
    readonly retryAfterSeconds?: number,
  ) {
    super(message, status, code);
    this.name = 'GiftPickupError';
  }
}

const toGiftError = (error: unknown, fallback: string): Error => {
  const base = toFormError(error, fallback);
  if (!(base instanceof ApiError)) return base;
  const data = axios.isAxiosError(error) ? error.response?.data : undefined;
  const num = (value: unknown) =>
    typeof value === 'number' && value >= 0 ? value : undefined;
  return new GiftPickupError(
    GIFT_ERROR_MESSAGES[base.code ?? ''] ?? base.message,
    base.status,
    base.code,
    num(data?.attemptsLeft),
    num(data?.retryAfterSeconds),
  );
};

/** 토큰·PIN은 URL 쿼리가 아니라 바디로만 보낸다. 응답은 no-store 다 */
export const getGiftPickupStatus = async (expoId: string, token: string) => {
  try {
    const { data } = await clientInstance.post<GiftPickupStatusDto>(
      `/surveys/${encodeURIComponent(expoId)}/gift-pickup/status`,
      { token },
    );
    return data;
  } catch (error) {
    throw toGiftError(error, '수령 상태를 확인하지 못했습니다.');
  }
};

/** 이미 완료된 토큰은 PIN과 상관없이 같은 완료 상태를 돌려준다(멱등) */
export const confirmGiftPickup = async (
  expoId: string,
  token: string,
  pin: string,
) => {
  try {
    const { data } = await clientInstance.post<GiftPickupStatusDto>(
      `/surveys/${encodeURIComponent(expoId)}/gift-pickup/confirm`,
      { token, pin },
    );
    return data;
  } catch (error) {
    throw toGiftError(error, '수령을 확인하지 못했습니다.');
  }
};

/** 관리자만. 설정 여부만 알려 주고 PIN 원문은 돌려주지 않는다 */
export const getGiftPin = async (expoId: string) => {
  try {
    const { data } = await clientTokenInstance.get<GiftPinStatusDto>(
      `/surveys/${encodeURIComponent(expoId)}/gift-pin`,
    );
    return data;
  } catch (error) {
    throw toGiftError(error, '직원 PIN 설정 여부를 불러오지 못했습니다.');
  }
};

/** 숫자 4~8자리. 바꾸면 이전 PIN은 쓸 수 없다 */
export const setGiftPin = async (expoId: string, pin: string) => {
  try {
    const { data } = await clientTokenInstance.put<GiftPinStatusDto>(
      `/surveys/${encodeURIComponent(expoId)}/gift-pin`,
      { pin },
    );
    return data;
  } catch (error) {
    throw toGiftError(error, '직원 PIN을 저장하지 못했습니다.');
  }
};
