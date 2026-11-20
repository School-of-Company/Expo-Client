import { useQuery } from '@tanstack/react-query';
import { getAdminData } from '../api/getAdminData';

/** 내 관리자 정보(GET /admin/my). 화면 여러 곳이 같은 응답을 나눠 쓴다 */
export const useMyAdmin = () =>
  useQuery({
    queryKey: ['requestAdminData'],
    queryFn: getAdminData,
    staleTime: 5 * 60 * 1000,
  });

/** 최고 관리자 여부. 조회 전·실패·예전 서버(필드 없음)는 false 다 */
export const useIsSuperAdmin = () => useMyAdmin().data?.superAdmin === true;
