import { useQuery } from '@tanstack/react-query';
import { Participant, Trainee } from '@/shared/types/expo-manage/type';
import {
  getTraineeExpoManageData,
  getParticipantExpoManageData,
} from '../api/getExpoManageData';

export const useExpoManageQueries = (
  id: string,
  selectOption: string,
  searchText: string,
) => {
  const traineeQueries = useQuery<Trainee[], Error>({
    queryKey: ['traineeData', id, searchText],
    queryFn: () => getTraineeExpoManageData(id, searchText),
    enabled: selectOption === 'trainee',
  });

  const participantQueries = useQuery<Participant[], Error>({
    queryKey: ['participantData', id, selectOption, searchText],
    queryFn: () => getParticipantExpoManageData(id, selectOption, searchText),
    enabled: selectOption !== 'trainee',
  });

  const expoQueries =
    selectOption === 'trainee' ? traineeQueries : participantQueries;

  return { expoQueries, isLoading: expoQueries.isLoading };
};
