import { useQuery } from '@tanstack/react-query';
import { useExpoList } from '@/shared/queries/useExpoList';
import { AdminData, SignUpItem } from '@/shared/types/admin/type';
import { getAdminData } from '../api/getAdminData';
import { getRequestSignUp } from '../api/getRequestSignUp';

export const useAdminData = () => {
  const { data: expoListData, isLoading: expoListLoading } = useExpoList();

  const requestSignUpData = useQuery<SignUpItem[], Error>({
    queryKey: ['requestSignUp'],
    queryFn: getRequestSignUp,
  });

  const requestAdminData = useQuery<AdminData, Error>({
    queryKey: ['requestAdminData'],
    queryFn: getAdminData,
  });

  const isLoading =
    expoListLoading ||
    requestSignUpData.isLoading ||
    requestAdminData.isLoading;

  return { expoListData, requestSignUpData, requestAdminData, isLoading };
};
