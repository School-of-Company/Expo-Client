import axios from 'axios';
import clientInstance from '../libs/http/clientInstance';
import { ApplicationForm } from '../types/application/type';

export type QrSurvey = ApplicationForm & { expoId: string };

export const getQrSurvey = async (token: string): Promise<QrSurvey> => {
  try {
    const response = await clientInstance.get(`/surveys/qr/${token}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        throw new Error('이미 응답한 QR입니다.');
      }
      throw new Error(error.response.data.error || '설문 불러오기 실패');
    }
    throw error;
  }
};
