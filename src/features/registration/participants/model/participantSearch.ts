import { maskPhoneNumber } from '../../common';

/** 형식을 모르는 번호도 뒤 4자리만 남긴다 */
export const maskParticipantPhone = (phone: string | null) => {
  if (!phone) return '-';
  const masked = maskPhoneNumber(phone);
  return masked === phone ? `****${phone.slice(-4)}` : masked;
};
