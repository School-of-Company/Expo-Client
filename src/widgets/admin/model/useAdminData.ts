import { useQuery } from '@tanstack/react-query';
import { AdminData, ExpoItem, SignUpItem } from '@/shared/types/admin/type';
import { getAdminData } from '../api/getAdminData';
import { getExpoList } from '../api/getExpoList';
import { getRequestSignUp } from '../api/getRequestSignUp';

export const useAdminData = () => {
  const expoListData = useQuery<ExpoItem[], Error>({
    queryKey: ['expoList'],
    queryFn: getExpoList,
  });

  const requestSignUpData = useQuery<SignUpItem[], Error>({
    queryKey: ['requestSignUp'],
    queryFn: getRequestSignUp,
  });

  const requestAdminData = useQuery<AdminData, Error>({
    queryKey: ['requestAdnubData'],
    queryFn: getAdminData,
  });

  const isLoading =
    expoListData.isLoading ||
    requestSignUpData.isLoading ||
    requestAdminData.isLoading;

  return { expoListData, requestSignUpData, requestAdminData, isLoading };
};
