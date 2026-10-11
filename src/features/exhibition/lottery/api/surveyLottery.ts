import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

export interface SurveyLottery {
  enabled: boolean;
  numbers: number[];
  /** 추첨이 켜져 있는 동안 센 공개 설문 응답 순번 */
  currentSequence: number;
}

const toError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return new Error('이 박람회에 참가자 만족도 조사가 없습니다.');
    }
    return new Error(error.response.data?.error || fallback);
  }
  return error;
};

export const getSurveyLottery = async (
  expoId: string,
): Promise<SurveyLottery> => {
  try {
    const response = await clientTokenInstance.get<SurveyLottery>(
      `/surveys/${expoId}/lottery`,
    );
    return response.data;
  } catch (error) {
    throw toError(error, '경품 추첨 설정을 불러오지 못했습니다.');
  }
};

export const patchSurveyLottery = async (
  expoId: string,
  data: Pick<SurveyLottery, 'enabled' | 'numbers'>,
): Promise<SurveyLottery> => {
  try {
    const response = await clientTokenInstance.patch<SurveyLottery>(
      `/surveys/${expoId}/lottery`,
      data,
    );
    return response.data;
  } catch (error) {
    throw toError(error, '경품 추첨 설정을 저장하지 못했습니다.');
  }
};
