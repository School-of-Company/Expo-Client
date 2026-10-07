import { useQuery } from '@tanstack/react-query';
import { useExpoPage } from '@/shared/queries';
import { getAdminData } from '../api/getAdminData';
import { getRequestSignUp } from '../api/getRequestSignUp';

export const useAdminData = () => {
  const {
    data: expoListData,
    isLoading: expoListLoading,
    page,
  } = useExpoPage();

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
    page,
    requestSignUpData,
    requestAdminData,
    isLoading,
  };
};
