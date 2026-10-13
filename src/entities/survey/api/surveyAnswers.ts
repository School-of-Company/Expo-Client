import { formRequest } from '@/entities/form/lib/errors';
import clientInstance from '@/shared/libs/http/clientInstance';
import type { SubmitSurveyAnswerRequestDto } from '../model/types';
import type { FormParticipantType } from '@/entities/form/model/types';

/**
 * 전화번호로 응답자를 확인하고 접수한다. 저장은 비동기라 202로 끝난다.
 * 503 EXTERNAL_SERVICE_UNAVAILABLE은 잠시 후 다시 보내면 된다.
 */
export const submitSurveyAnswer = (
  expoId: string,
  participationType: FormParticipantType,
  data: SubmitSurveyAnswerRequestDto,
) =>
  formRequest<void>(
    clientInstance.post(
      `/surveys/answer/${participationType.toLowerCase()}/${expoId}`,
      data,
    ),
    '만족도 조사를 제출하지 못했습니다.',
  );
