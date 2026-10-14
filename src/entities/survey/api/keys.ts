import type { FormParticipantType } from '@/entities/form/model/types';

/** 박람회 단위로 묶어서 설문을 고치면 `expo(expoId)` 하나로 공개 설문·추첨까지 무효화한다. */
export const surveyKeys = {
  all: ['surveys'] as const,
  expo: (expoId: string) => [...surveyKeys.all, expoId] as const,
  detail: (expoId: string, participationType: FormParticipantType) =>
    [...surveyKeys.expo(expoId), participationType] as const,
  public: (expoId: string) => [...surveyKeys.expo(expoId), 'public'] as const,
  lottery: (expoId: string) => [...surveyKeys.expo(expoId), 'lottery'] as const,
};
