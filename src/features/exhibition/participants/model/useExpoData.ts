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
  sessionId?: number,
) => {
  const isTrainee = userType === 'TRAINEE';

  // 연수자는 날짜와 상관없이 전체 목록을 받으므로 날짜 선택을 기다리지 않는다
  const traineeQueries = useQuery<TraineeResponse, Error>({
    queryKey: ['traineeData', id],
    queryFn: () => getTraineeExpoManageData(id),
    enabled: isTrainee,
  });

  const participantQueries = useQuery<ParticipantResponse, Error>({
    queryKey: ['participantData', id, page, date, sessionId],
    queryFn: () => getParticipantExpoManageData(id, page, date, sessionId),
    enabled: !isTrainee && enabled,
  });

  const expoManageQueries = isTrainee ? traineeQueries : participantQueries;

  return { expoManageQueries, isLoading: expoManageQueries.isLoading };
};
