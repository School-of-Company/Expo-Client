import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { SurveyFormRequest } from '@/shared/types/form/create/type';
import { createSurveyForm } from '../api/createSurveyForm';
import { deleteSurvey } from '../api/deleteSurvey';
import { editSurveyForm } from '../api/editSurveyForm';
import { getSurvey } from '../api/getSurvey';
import { surveyLotteryQueryKey } from '../lottery/model/useSurveyLottery';

type ParticipationType = 'STANDARD' | 'TRAINEE';

export const surveyQueryKey = (expoId: string, type: ParticipationType) => [
  'surveyAdmin',
  expoId,
  type,
];

export const useSurvey = (expoId: string, type: ParticipationType) =>
  useQuery({
    queryKey: surveyQueryKey(expoId, type),
    queryFn: () => getSurvey(expoId, type),
  });

/** 응답 화면(getSurveyForm), 참가자 폼 목록, 경품 추첨 캐시를 비운다. 설문이 바뀌면 모두 달라진다. */
const invalidateSurveyViews = (queryClient: QueryClient, expoId: string) => {
  queryClient.invalidateQueries({ queryKey: ['getSurveyForm', expoId] });
  queryClient.invalidateQueries({
    queryKey: ['applicationFormEntry', expoId],
  });
  queryClient.invalidateQueries({ queryKey: surveyLotteryQueryKey(expoId) });
};

// type·isEdit 는 mutate 인자로 받는다. 진행 중에 탭을 옮겨도 onSuccess 가 요청 당시 탭을 쓰게 하려고.
type SaveVariables = {
  type: ParticipationType;
  isEdit: boolean;
  data: SurveyFormRequest;
};

/** 설문이 있으면 PATCH, 없으면 POST. */
export const useSaveSurvey = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ isEdit, data }: SaveVariables) =>
      (isEdit ? editSurveyForm : createSurveyForm)({ data, id: expoId }),
    onSuccess: (_, { type, isEdit }) => {
      toast.success(
        isEdit ? '만족도 조사를 수정했습니다.' : '만족도 조사를 만들었습니다.',
      );
      queryClient.invalidateQueries({ queryKey: surveyQueryKey(expoId, type) });
      invalidateSurveyViews(queryClient, expoId);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteSurvey = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: ParticipationType) => deleteSurvey(expoId, type),
    onSuccess: (_, type) => {
      toast.success('만족도 조사를 삭제했습니다.');
      queryClient.setQueryData(surveyQueryKey(expoId, type), null);
      invalidateSurveyViews(queryClient, expoId);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
