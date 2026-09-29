import { useQuery } from '@tanstack/react-query';
import { useExpoPage } from '@/shared/queries';
import { getAdminData } from '../api/getAdminData';
import { getRequestSignUp } from '../api/getRequestSignUp';

export const useAdminData = (page: number) => {
  const {
    data: expoListData,
    isLoading: expoListLoading,
    error: expoListError,
  } = useExpoPage(page);

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

  return {
    expoListData,
    expoListError,
    requestSignUpData,
    requestAdminData,
    isLoading,
  };
};
