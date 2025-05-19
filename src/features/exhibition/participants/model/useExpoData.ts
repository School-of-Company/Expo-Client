import { useQuery } from '@tanstack/react-query';
import {
  ParticipantResponse,
  TraineeResponse,
} from '@/shared/types/exhibition/participants/type';
import {
  getTraineeExpoManageData,
  getParticipantExpoManageData,
} from '../api/getExpoManageData';

export const useExpoManageQueries = (
  id: string,
  userType: string,
  page: number,
  date: string,
  enabled: boolean,
) => {
  const isTrainee = userType === 'TRAINEE';

  const traineeQueries = useQuery<TraineeResponse, Error>({
    queryKey: ['traineeData', id, page, date],
    queryFn: () => getTraineeExpoManageData(id, page, date),
    enabled: isTrainee && enabled,
  });

  const participantQueries = useQuery<ParticipantResponse, Error>({
    queryKey: ['participantData', id, page, date],
    queryFn: () => getParticipantExpoManageData(id, page, date),
    enabled: !isTrainee && enabled,
  });

  const expoManageQueries = isTrainee ? traineeQueries : participantQueries;

  return { expoManageQueries, isLoading: expoManageQueries.isLoading };
};
