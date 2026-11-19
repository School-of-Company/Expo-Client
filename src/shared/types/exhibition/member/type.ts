/**
 * 박람회 운영진 역할(Expo-Expo-Server#256). 운영진 표에는 이 셋만 저장한다.
 * 스태프는 운영진이 아니라 링크로 받는 토큰이라 여기 없다
 */
export type ExpoMemberRole = 'OWNER' | 'MANAGER' | 'VIEWER';

/** GET /expo/{id}/members 항목. 서버는 관리자 ID 와 역할만 준다 */
export interface ExpoMember {
  adminId: number;
  role: ExpoMemberRole;
}

/** POST·GET /expo/{id}/staff-invites 응답. secret 은 만들 때 한 번만 오고 목록에서는 null 이다 */
export interface ExpoStaffInvite {
  inviteId: string;
  expoId: string;
  label: string;
  expiresAt: string;
  revokedAt: string | null;
  secret: string | null;
}

/** POST /staff-auth 응답. 새로고침 토큰은 없고 15분 안에 끝난다 */
export interface StaffToken {
  accessToken: string;
  accessTokenExpiresIn: string;
}
