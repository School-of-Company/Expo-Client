import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { SurveyFormRequest } from '@/shared/types/form/create/type';
import { createSurveyForm } from '../api/createSurveyForm';
import { deleteSurvey } from '../api/deleteSurvey';
import { editSurveyForm } from '../api/editSurveyForm';
import { getSurvey } from '../api/getSurvey';

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

/** 설문이 있으면 PATCH, 없으면 POST. 응답 화면이 쓰는 getSurveyForm 캐시도 함께 비운다. */
export const useSaveSurvey = (
  expoId: string,
  type: ParticipationType,
  isEdit: boolean,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SurveyFormRequest) =>
      (isEdit ? editSurveyForm : createSurveyForm)({ data, id: expoId }),
    onSuccess: () => {
      toast.success(
        isEdit ? '만족도 조사를 수정했습니다.' : '만족도 조사를 만들었습니다.',
      );
      queryClient.invalidateQueries({ queryKey: surveyQueryKey(expoId, type) });
      queryClient.invalidateQueries({ queryKey: ['getSurveyForm', expoId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteSurvey = (expoId: string, type: ParticipationType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteSurvey(expoId, type),
    onSuccess: () => {
      toast.success('만족도 조사를 삭제했습니다.');
      queryClient.setQueryData(surveyQueryKey(expoId, type), null);
      queryClient.invalidateQueries({ queryKey: ['getSurveyForm', expoId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
