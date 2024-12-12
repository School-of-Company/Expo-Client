import { useQuery } from '@tanstack/react-query';
import { ExpoItem, SignUpItem } from '@/shared/types/admin/type';
import { getExpoList, getRequestSignUp } from '../api/getAdminData';

export const useAdminData = () => {
  const expoListData = useQuery<ExpoItem[], Error>({
    queryKey: ['expoList'],
    queryFn: getExpoList,
  });

  const requestSignUpData = useQuery<SignUpItem[], Error>({
    queryKey: ['requestSignUp'],
    queryFn: getRequestSignUp,
  });

  const isLoading = expoListData.isLoading || requestSignUpData.isLoading;

  return { expoListData, requestSignUpData, isLoading };
};
