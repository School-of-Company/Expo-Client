import { useIsSuperAdmin } from '@/features/admin';
import { useExpoValid } from '@/features/exhibition/list';
import {
  canDeleteExpo,
  canManageMembers,
  isMonitoringOnly,
} from '@/shared/config';

/**
 * 이 박람회에서 내 역할로 보일 메뉴. 역할은 GET /expo/valid 의 myRole 로 찾는다(박람회 상세 응답에는 없다).
 * 조회 전·실패면 역할을 모르는 것으로 보고 메뉴를 숨기지 않는다. 실제 차단은 서버가 한다
 */
export const useExpoPermission = (expoId: string) => {
  const { data: expoValidMap } = useExpoValid();
  const superAdmin = useIsSuperAdmin();
  const myRole =
    expoValidMap?.get(expoId)?.myRole ??
    expoValidMap?.get(expoId.toLowerCase())?.myRole ??
    null;

  return {
    myRole,
    canManageMembers: canManageMembers(myRole, superAdmin),
    canDelete: superAdmin || canDeleteExpo(myRole),
    isMonitoringOnly: !superAdmin && isMonitoringOnly(myRole),
  };
};
