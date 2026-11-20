import { useQuery } from '@tanstack/react-query';
import { useExpoPage } from '@/shared/queries';
import { getRequestSignUp } from '../api/getRequestSignUp';
import { useMyAdmin } from './useMyAdmin';

export const useAdminData = () => {
  const {
    data: expoListData,
    isLoading: expoListLoading,
    page,
  } = useExpoPage();

  const requestAdminData = useMyAdmin();
  // 가입 승인은 최고 관리자만 한다(GET /admin 은 다른 관리자에게 403).
  // superAdmin 을 주지 않는 예전 서버는 모든 관리자가 승인했으므로 그대로 보인다
  const superAdmin = requestAdminData.data?.superAdmin;
  const canApproveSignUp = requestAdminData.isSuccess && superAdmin !== false;

  const requestSignUpData = useQuery({
    queryKey: ['requestSignUp'],
    queryFn: getRequestSignUp,
    enabled: canApproveSignUp,
  });

  const isLoading =
    expoListLoading ||
    (canApproveSignUp && requestSignUpData.isLoading) ||
    requestAdminData.isLoading;

  return {
    expoListData,
    page,
    requestSignUpData,
    requestAdminData,
    canApproveSignUp,
    superAdmin: superAdmin === true,
    isLoading,
  };
};
