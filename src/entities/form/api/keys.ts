import type { ApplicationType, FormParticipantType } from '../model/types';

/** 박람회 단위로 묶어서 `expo(expoId)` 하나로 그 박람회의 폼을 모두 무효화할 수 있다. */
export const formKeys = {
  all: ['forms'] as const,
  expo: (expoId: string) => [...formKeys.all, expoId] as const,
  detail: (
    expoId: string,
    participantType: FormParticipantType,
    applicationType: ApplicationType,
  ) => [...formKeys.expo(expoId), participantType, applicationType] as const,
};

export const programFormKeys = {
  all: ['programForms'] as const,
  detail: (formId: string) => [...programFormKeys.all, formId] as const,
  /** 폼 ID 는 UUID 라 'list' 와 겹치지 않는다 */
  lists: () => [...programFormKeys.all, 'list'] as const,
  list: (expoId: string) => [...programFormKeys.lists(), expoId] as const,
};
