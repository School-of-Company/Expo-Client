import axios from 'axios';
import clientTokenInstance from '@/shared/libs/clientTokenInstance';
import { Participant, Trainee } from '@/shared/types/expo-manage/type';

export const getTraineeExpoManageData = async (
  id: string,
  searchText: string,
): Promise<Trainee[]> => {
  try {
    const response = await clientTokenInstance.get(`/trainee/${id}`, {
      params: { name: searchText },
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
  searchText: string,
): Promise<Participant[]> => {
  try {
    const response = await clientTokenInstance.get(`/participant/${id}`, {
      params: { type, name: searchText },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '참가자 불러오기 실패');
    }
    throw error;
  }
};
