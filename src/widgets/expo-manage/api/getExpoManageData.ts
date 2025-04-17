import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  ParticipantResponse,
  TraineeResponse,
} from '@/shared/types/expo-manage/type';

export const getTraineeExpoManageData = async (
  id: string,
  page: number,
  date: string,
): Promise<TraineeResponse> => {
  try {
    const response = await clientTokenInstance.get(
      `/api/server/token/trainee/${id}`,
      {
        params: { page: page - 1, size: 7, date },
      },
    );
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
  date: string,
): Promise<ParticipantResponse> => {
  try {
    const response = await clientTokenInstance.get(
      `/api/server/token/participant/${id}`,
      {
        params: { type, page: page - 1, size: 7, date },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '참가자 불러오기 실패');
    }
    throw error;
  }
};
