import { useQuery } from '@tanstack/react-query';
import {
  RegistrationHistory,
  RegistrationMonitoring,
} from '@/shared/types/registration/type';
import {
  mockGetRegistrationHistories as getRegistrationHistories,
  mockGetRegistrationMonitoring as getRegistrationMonitoring,
} from '../api/mockRegistration';

const MONITORING_REFRESH_INTERVAL = 10 * 1000;

export const useRegistrationMonitoring = () =>
  useQuery<RegistrationMonitoring, Error>({
    queryKey: ['registrationMonitoring'],
    queryFn: getRegistrationMonitoring,
    refetchInterval: MONITORING_REFRESH_INTERVAL,
  });

export const useRegistrationHistories = () =>
  useQuery<RegistrationHistory[], Error>({
    queryKey: ['registrationHistories'],
    queryFn: getRegistrationHistories,
  });
