import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSurveyLottery, patchSurveyLottery } from '../api/surveyLottery';

export const surveyLotteryQueryKey = (expoId: string) => [
  'surveyLottery',
  expoId,
];

export const useSurveyLottery = (expoId: string) =>
  useQuery({
    queryKey: surveyLotteryQueryKey(expoId),
    queryFn: () => getSurveyLottery(expoId),
    retry: false,
  });

export const useUpdateSurveyLottery = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof patchSurveyLottery>[1]) =>
      patchSurveyLottery(expoId, data),
    onSuccess: (data) =>
      queryClient.setQueryData(surveyLotteryQueryKey(expoId), data),
  });
};
