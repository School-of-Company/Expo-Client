import { useQuery } from '@tanstack/react-query';
import { useExpoList } from '@/shared/queries';
import { getAdminData } from '../api/getAdminData';
import { getRequestSignUp } from '../api/getRequestSignUp';

export const useAdminData = () => {
  const { data: expoListData, isLoading: expoListLoading } = useExpoList();

  const requestSignUpData = useQuery({
    queryKey: ['requestSignUp'],
    queryFn: getRequestSignUp,
  });

  const requestAdminData = useQuery({
    queryKey: ['requestAdminData'],
    queryFn: getAdminData,
  });

  const isLoading =
    expoListLoading ||
    requestSignUpData.isLoading ||
    requestAdminData.isLoading;

  return { expoListData, requestSignUpData, requestAdminData, isLoading };
};
