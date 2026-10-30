import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveyKeys } from '../api/keys';
import { submitSurveyAnswer } from '../api/surveyAnswers';
import { confirmGiftPickup, getGiftPickupStatus } from '../api/surveyGift';
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

/** 토큰을 잃으면(저장소 비움 등) 호출하지 않는다. 미확인·완료를 가정하지 않기 위해 오류는 호출부가 안내한다 */
export const useGiftPickupStatusQuery = (expoId: string, token: string) =>
  useQuery({
    queryKey: surveyKeys.giftPickup(expoId, token),
    queryFn: () => getGiftPickupStatus(expoId, token),
    retry: false,
    meta: { silent: true },
  });

/** 성공하면 응답(완료 상태)을 캐시에 넣어 화면이 서버가 확정한 상태로 바뀌게 한다 */
export const useConfirmGiftPickupMutation = (expoId: string, token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => confirmGiftPickup(expoId, token),
    onSuccess: (data) =>
      queryClient.setQueryData(surveyKeys.giftPickup(expoId, token), data),
  });
};
