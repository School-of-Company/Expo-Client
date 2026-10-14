import { toFormError } from '@/entities/form/lib/errors';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import type { SurveyResponseDto } from '@/entities/survey';

/**
 * 관리자 화면용 설문 조회. 공개 프록시는 관리자 토큰을 넘기지 않아 401이 나므로 토큰 프록시로 부른다.
 * 설문이 아직 없으면(404) null을 돌려준다.
 */
export const getSurvey = async (
  expoId: string,
  type: 'STANDARD' | 'TRAINEE',
): Promise<SurveyResponseDto | null> => {
  try {
    const response = await clientTokenInstance.get<SurveyResponseDto>(
      `/surveys/${expoId}`,
      { params: { type } },
    );
    return response.data;
  } catch (error) {
    if (getErrorStatus(error) === 404) return null;
    throw toFormError(error, '만족도 조사를 불러오지 못했습니다.');
  }
};
