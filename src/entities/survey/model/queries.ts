import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveyKeys } from '../api/keys';
import { submitSurveyAnswer } from '../api/surveyAnswers';
import { getSurveyLottery, updateSurveyLottery } from '../api/surveyLottery';
import { getPublicSurvey, submitPublicSurveyAnswer } from '../api/surveyPublic';
import {
  createSurvey,
  deleteSurvey,
  getSurvey,
  updateSurvey,
} from '../api/surveys';
import type {
  CreateSurveyRequestDto,
  SubmitPublicSurveyAnswerRequestDto,
  SubmitSurveyAnswerRequestDto,
  UpdateSurveyLotteryRequestDto,
  UpdateSurveyRequestDto,
} from './types';
import type { FormParticipantType } from '@/entities/form/model/types';

/** 토스트·이동은 호출부가 `mutate(data, { onSuccess })`로 붙인다. 여기서는 캐시만 맞춘다. */

export const useSurveyQuery = (
  expoId: string,
  participationType: FormParticipantType,
  {
    enabled = true,
    admin = false,
  }: { enabled?: boolean; admin?: boolean } = {},
) =>
  useQuery({
    queryKey: [...surveyKeys.detail(expoId, participationType), { admin }],
    queryFn: () => getSurvey(expoId, participationType, { admin }),
    enabled,
  });

export const useCreateSurveyMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSurveyRequestDto) => createSurvey(expoId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: surveyKeys.expo(expoId) }),
  });
};

export const useUpdateSurveyMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSurveyRequestDto) => updateSurvey(expoId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: surveyKeys.expo(expoId) }),
  });
};

export const useDeleteSurveyMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (participationType: FormParticipantType) =>
      deleteSurvey(expoId, participationType),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: surveyKeys.expo(expoId) }),
  });
};

export const useSubmitSurveyAnswerMutation = (
  expoId: string,
  participationType: FormParticipantType,
) =>
  useMutation({
    mutationFn: (data: SubmitSurveyAnswerRequestDto) =>
      submitSurveyAnswer(expoId, participationType, data),
  });

export const usePublicSurveyQuery = (
  expoId: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: surveyKeys.public(expoId),
    queryFn: () => getPublicSurvey(expoId),
    enabled,
  });

export const useSubmitPublicSurveyAnswerMutation = (expoId: string) =>
  useMutation({
    mutationFn: (data: SubmitPublicSurveyAnswerRequestDto) =>
      submitPublicSurveyAnswer(expoId, data),
  });

export const useSurveyLotteryQuery = (expoId: string) =>
  useQuery({
    queryKey: surveyKeys.lottery(expoId),
    queryFn: () => getSurveyLottery(expoId),
    retry: false,
  });

export const useUpdateSurveyLotteryMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSurveyLotteryRequestDto) =>
      updateSurveyLottery(expoId, data),
    onSuccess: (data) =>
      queryClient.setQueryData(surveyKeys.lottery(expoId), data),
  });
};
