import type { ExpoMemberRole } from '../types/exhibition/member/type';

/**
 * 박람회 운영진 역할별로 화면에 보일 메뉴를 정한다. 실제 차단은 서버가 하고 화면은 숨기기만 한다.
 * 역할을 모르면(null·undefined) 숨기지 않는다. 역할 판정을 켜기 전 서버는 myRole 을 주지 않고,
 * 최고 관리자도 소속 없는 박람회는 null 로 받기 때문이다
 */

export const EXPO_MEMBER_ROLES: readonly ExpoMemberRole[] = [
  'OWNER',
  'MANAGER',
  'VIEWER',
];

export const EXPO_MEMBER_ROLE_LABEL: Record<ExpoMemberRole, string> = {
  OWNER: '소유자',
  MANAGER: '운영자',
  VIEWER: '열람자',
};

export const EXPO_MEMBER_ROLE_DESCRIPTION: Record<ExpoMemberRole, string> = {
  OWNER: '운영진·스태프 링크 관리와 박람회 삭제까지 모두',
  MANAGER: '수정·명단 조회·입장 처리. 운영진 관리와 삭제는 못 함',
  VIEWER: '모니터링만 보기',
};

type Role = ExpoMemberRole | null | undefined;

/** 운영진·스태프 링크 관리. 서버는 OWNER 와 최고 관리자만 받는다 */
export const canManageMembers = (role: Role, superAdmin = false) =>
  superAdmin || role === 'OWNER';

/** 박람회 삭제. 역할을 모르면 서버 판정에 맡긴다 */
export const canDeleteExpo = (role: Role) => role == null || role === 'OWNER';

/** VIEWER 는 모니터링만 본다 */
export const isMonitoringOnly = (role: Role) => role === 'VIEWER';
