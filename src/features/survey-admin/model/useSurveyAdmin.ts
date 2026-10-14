import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  createSurvey,
  CreateSurveyRequestDto,
  deleteSurvey,
  surveyKeys,
  updateSurvey,
} from '@/entities/survey';
import { getSurvey } from '../api/getSurvey';

type ParticipationType = 'STANDARD' | 'TRAINEE';

export const useSurvey = (expoId: string, type: ParticipationType) =>
  useQuery({
    queryKey: surveyKeys.detail(expoId, type),
    queryFn: () => getSurvey(expoId, type),
  });

/** 설문·공개 설문·추첨(surveyKeys.expo)과 응답 화면, 참가자 폼 목록 캐시를 비운다. */
const invalidateSurveyViews = (queryClient: QueryClient, expoId: string) => {
  queryClient.invalidateQueries({ queryKey: surveyKeys.expo(expoId) });
  queryClient.invalidateQueries({ queryKey: ['getSurveyForm', expoId] });
  queryClient.invalidateQueries({
    queryKey: ['applicationFormEntry', expoId],
  });
};

// type·isEdit 는 mutate 인자로 받는다. 진행 중에 탭을 옮겨도 onSuccess 가 요청 당시 탭을 쓰게 하려고.
type SaveVariables = {
  isEdit: boolean;
  data: CreateSurveyRequestDto;
};

/** 설문이 있으면 PATCH, 없으면 POST. 대상 탭은 data.participationType 이다. */
export const useSaveSurvey = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ isEdit, data }: SaveVariables) => {
      await (isEdit ? updateSurvey(expoId, data) : createSurvey(expoId, data));
    },
    onSuccess: (_, { isEdit }) => {
      toast.success(
        isEdit ? '만족도 조사를 수정했습니다.' : '만족도 조사를 만들었습니다.',
      );
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
      queryClient.setQueryData(surveyKeys.detail(expoId, type), null);
      invalidateSurveyViews(queryClient, expoId);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
