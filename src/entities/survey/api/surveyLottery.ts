import { formRequest } from '@/entities/form/lib/errors';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import type {
  SurveyLotteryResponseDto,
  UpdateSurveyLotteryRequestDto,
} from '../model/types';

export const getSurveyLottery = (expoId: string) =>
  formRequest<SurveyLotteryResponseDto>(
    clientTokenInstance.get(`/surveys/${expoId}/lottery`),
    '경품 추첨 설정을 불러오지 못했습니다.',
  );

/** 바꿔도 이미 지나간 순번은 다시 오지 않는다. */
export const updateSurveyLottery = (
  expoId: string,
  data: UpdateSurveyLotteryRequestDto,
) =>
  formRequest<SurveyLotteryResponseDto>(
    clientTokenInstance.patch(`/surveys/${expoId}/lottery`, data),
    '경품 추첨 설정을 저장하지 못했습니다.',
  );
