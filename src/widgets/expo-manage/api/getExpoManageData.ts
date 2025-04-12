import axios from 'axios';
import {
  ParticipantResponse,
  TraineeResponse,
} from '@/shared/types/expo-manage/type';

export const getTraineeExpoManageData = async (
  id: string,
  page: number,
  date?: string,
): Promise<TraineeResponse> => {
  try {
    const today = date || new Date().toISOString().split('T')[0];
    const response = await axios.get(`/api/server/token/trainee/${id}`, {
      params: { page: page - 1, size: 7, date: today },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '연수자 불러오기 실패');
    }
    throw error;
  }
};

export const getParticipantExpoManageData = async (
  id: string,
  type: string,
  page: number,
  date?: string,
): Promise<ParticipantResponse> => {
  try {
    const today = date || new Date().toISOString().split('T')[0];

    const response = await axios.get(`/api/server/token/participant/${id}`, {
      params: { type, page: page - 1, size: 7, date: today },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '참가자 불러오기 실패');
    }
    throw error;
  }
};
