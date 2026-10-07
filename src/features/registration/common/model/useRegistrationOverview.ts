import { useQuery } from '@tanstack/react-query';
import { RegistrationOverview } from '@/shared/types/registration/type';
import { mockGetRegistrationOverview as getRegistrationOverview } from '../api/mockRegistration';

export const useRegistrationOverview = () =>
  useQuery<RegistrationOverview, Error>({
    queryKey: ['registrationOverview'],
    queryFn: getRegistrationOverview,
  });
