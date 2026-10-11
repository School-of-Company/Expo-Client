import axios from 'axios';
import clientInstance from '../libs/http/clientInstance';
import { QrSurvey } from './getQrSurvey';

/**
 * 입장 QR과 무관한 공개 설문 조회(Form PR #95). 로그인 없이 호출하고
 * 응답 모양은 종이 QR 설문(`GET /surveys/qr/:token`)과 같다.
 */
export const getPublicSurvey = async (expoId: string): Promise<QrSurvey> => {
  try {
    const response = await clientInstance.get(`/surveys/public/${expoId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error('진행 중인 설문이 없습니다.');
      }
      throw new Error(error.response.data.error || '설문 불러오기 실패');
    }
    throw error;
  }
};
