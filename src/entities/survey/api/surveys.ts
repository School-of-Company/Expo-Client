import { formRequest } from '@/entities/form/lib/errors';
import clientInstance from '@/shared/libs/http/clientInstance';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import type {
  CreateSurveyRequestDto,
  CreateSurveyResponseDto,
  SurveyResponseDto,
  UpdateSurveyRequestDto,
} from '../model/types';
import type { FormParticipantType } from '@/entities/form/model/types';

/**
 * 응답 페이지가 surveyId를 모르므로 (박람회, 참여자군)으로 찾는다. 기본은 로그인 없이 호출한다.
 * 관리자 화면은 `admin`으로 토큰 프록시를 탄다. 공개 프록시는 관리자 토큰을 넘기지 않아 401이 난다.
 */
export const getSurvey = (
  expoId: string,
  participationType: FormParticipantType,
  { admin = false }: { admin?: boolean } = {},
) =>
  formRequest<SurveyResponseDto>(
    (admin ? clientTokenInstance : clientInstance).get(`/surveys/${expoId}`, {
      params: { type: participationType },
    }),
    '만족도 조사를 불러오지 못했습니다.',
  );

export const createSurvey = (expoId: string, data: CreateSurveyRequestDto) =>
  formRequest<CreateSurveyResponseDto>(
    clientTokenInstance.post(`/surveys/${expoId}`, data),
    '만족도 조사를 만들지 못했습니다.',
  );

/** 204. 대상은 바디의 `participationType`으로 정해진다. */
export const updateSurvey = (expoId: string, data: UpdateSurveyRequestDto) =>
  formRequest<void>(
    clientTokenInstance.patch(`/surveys/${expoId}`, data),
    '만족도 조사를 수정하지 못했습니다.',
  );

/** 문항과 공개 링크 응답도 함께 지워진다. */
export const deleteSurvey = (
  expoId: string,
  participationType: FormParticipantType,
) =>
  formRequest<void>(
    clientTokenInstance.delete(`/surveys/${expoId}/${participationType}`),
    '만족도 조사를 삭제하지 못했습니다.',
  );
