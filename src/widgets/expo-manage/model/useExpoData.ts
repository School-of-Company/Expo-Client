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
  date: string,
) => {
  const traineeQueries = useQuery<TraineeResponse, Error>({
    queryKey: ['traineeData', id, page, date],
    queryFn: () => getTraineeExpoManageData(id, page, date),
    enabled: selectOption === 'trainee',
  });

  const participantQueries = useQuery<ParticipantResponse, Error>({
    queryKey: ['participantData', id, selectOption, page, date],
    queryFn: () => getParticipantExpoManageData(id, selectOption, page, date),
    enabled: selectOption !== 'trainee',
  });

  const expoManageQueries =
    selectOption === 'trainee' ? traineeQueries : participantQueries;

  return { expoManageQueries, isLoading: expoManageQueries.isLoading };
};
