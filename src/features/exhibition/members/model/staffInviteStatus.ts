import type { ExpoStaffInvite } from '@/shared/types/exhibition/member/type';

export type StaffInviteStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export const STAFF_INVITE_STATUS_LABEL: Record<StaffInviteStatus, string> = {
  ACTIVE: '사용 중',
  EXPIRED: '만료',
  REVOKED: '회수됨',
};

/** 회수가 만료보다 앞선다. 서버도 둘 중 하나면 토큰을 내주지 않는다 */
export const toStaffInviteStatus = (
  { expiresAt, revokedAt }: Pick<ExpoStaffInvite, 'expiresAt' | 'revokedAt'>,
  now: number,
): StaffInviteStatus => {
  if (revokedAt) return 'REVOKED';
  return Date.parse(expiresAt) <= now ? 'EXPIRED' : 'ACTIVE';
};
