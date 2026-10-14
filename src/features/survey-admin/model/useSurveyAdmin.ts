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
  getSurvey,
  surveyKeys,
  updateSurvey,
} from '@/entities/survey';
import { getErrorStatus } from '@/shared/libs/http/apiError';

type ParticipationType = 'STANDARD' | 'TRAINEE';

// 응답 화면(useSurveyQuery)과 키를 나눈다. 이쪽은 설문이 없으면(404) null 을 캐시에 두기 때문이다.
const adminSurveyKey = (expoId: string, type: ParticipationType) =>
  [...surveyKeys.detail(expoId, type), 'admin'] as const;

/** 관리자 화면용 설문 조회. 설문이 아직 없으면(404) null 을 돌려준다. */
export const useSurvey = (expoId: string, type: ParticipationType) =>
  useQuery({
    queryKey: adminSurveyKey(expoId, type),
    queryFn: () =>
      getSurvey(expoId, type, { admin: true }).catch((error) => {
        if (getErrorStatus(error) === 404) return null;
        throw error;
      }),
  });

/** 설문·공개 설문·추첨·응답 화면(surveyKeys.expo)과 참가자 폼 목록 캐시를 비운다. */
const invalidateSurveyViews = (queryClient: QueryClient, expoId: string) => {
  queryClient.invalidateQueries({ queryKey: surveyKeys.expo(expoId) });
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
      queryClient.setQueryData(adminSurveyKey(expoId, type), null);
      invalidateSurveyViews(queryClient, expoId);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
