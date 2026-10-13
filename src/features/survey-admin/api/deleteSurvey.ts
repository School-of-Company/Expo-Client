import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

/** 설문과 문항, 공개 링크 응답을 함께 삭제한다. */
export const deleteSurvey = async (
  expoId: string,
  participationType: 'STANDARD' | 'TRAINEE',
) => {
  try {
    await clientTokenInstance.delete(`/surveys/${expoId}/${participationType}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error || '만족도 조사 삭제에 실패했습니다.',
      );
    }
    throw error;
  }
};
