import { useQuery } from '@tanstack/react-query';
import { Participant, Trainee } from '@/shared/types/expo-manage/type';
import {
  getTraineeExpoManageData,
  getParticipantExpoManageData,
} from '../api/getExpoManageData';

export const useExpoManageQueries = (id: string, selectOption: string) => {
  const traineeQueries = useQuery<Trainee[], Error>({
    queryKey: ['traineeData', id],
    queryFn: () => getTraineeExpoManageData(id),
    enabled: selectOption === 'trainee',
  });
  const participantQueries = useQuery<Participant[], Error>({
    queryKey: ['participantData', id, selectOption],
    queryFn: () => getParticipantExpoManageData(id, selectOption),
    enabled: selectOption !== 'trainee',
  });

  const expoQueries =
    selectOption === 'trainee' ? traineeQueries : participantQueries;

  return { expoQueries, isLoading: expoQueries.isLoading };
};
