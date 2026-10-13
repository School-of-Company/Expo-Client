import { formRequest } from '@/entities/form/lib/errors';
import clientInstance from '@/shared/libs/http/clientInstance';
import type {
  PublicSurveyAnswerResponseDto,
  PublicSurveyResponseDto,
  SubmitPublicSurveyAnswerRequestDto,
} from '../model/types';

/** 일반 참가자 설문을 입장 확인 없이 조회한다. */
export const getPublicSurvey = (expoId: string) =>
  formRequest<PublicSurveyResponseDto>(
    clientInstance.get(`/surveys/public/${expoId}`),
    '만족도 조사를 불러오지 못했습니다.',
  );

/** 익명이라 여러 번 응답할 수 있다. 추첨이 켜져 있으면 당첨 여부가 온다. */
export const submitPublicSurveyAnswer = (
  expoId: string,
  data: SubmitPublicSurveyAnswerRequestDto,
) =>
  formRequest<PublicSurveyAnswerResponseDto>(
    clientInstance.post(`/surveys/answer/public/${expoId}`, data),
    '만족도 조사를 제출하지 못했습니다.',
  );
