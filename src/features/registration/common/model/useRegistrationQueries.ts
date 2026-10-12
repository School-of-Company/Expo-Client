import { useQuery } from '@tanstack/react-query';
import { RegistrationHistory } from '@/shared/types/registration/type';
import { mockGetRegistrationHistories as getRegistrationHistories } from '../api/mockRegistration';

export const useRegistrationHistories = () =>
  useQuery<RegistrationHistory[], Error>({
    queryKey: ['registrationHistories'],
    queryFn: getRegistrationHistories,
  });
