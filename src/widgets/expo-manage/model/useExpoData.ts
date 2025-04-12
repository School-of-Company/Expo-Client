import { useQuery } from '@tanstack/react-query';
import {
  ParticipantResponse,
  TraineeResponse,
} from '@/shared/types/expo-manage/type';
import {
  getTraineeExpoManageData,
  getParticipantExpoManageData,
} from '../api/getExpoManageData';

export const useExpoManageQueries = (
  id: string,
  selectOption: string,
  page: number,
) => {
  const traineeQueries = useQuery<TraineeResponse, Error>({
    queryKey: ['traineeData', id, page],
    queryFn: () => getTraineeExpoManageData(id, page),
    enabled: selectOption === 'trainee',
  });

  const participantQueries = useQuery<ParticipantResponse, Error>({
    queryKey: ['participantData', id, selectOption, page],
    queryFn: () => getParticipantExpoManageData(id, selectOption, page),
    enabled: selectOption !== 'trainee',
  });

  const expoQueries =
    selectOption === 'trainee' ? traineeQueries : participantQueries;

  return { expoQueries, isLoading: expoQueries.isLoading };
};
