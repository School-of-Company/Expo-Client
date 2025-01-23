import axios from 'axios';
import { Participant, Trainee } from '@/shared/types/expo-manage/type';

export const getTraineeExpoManageData = async (
  id: string,
  searchText: string,
): Promise<Trainee[]> => {
  const response = await axios.get(`/api/trainee/${id}`, {
    params: { name: searchText },
  });
  return response.data;
};

export const getParticipantExpoManageData = async (
  id: string,
  type: string,
  searchText: string,
): Promise<Participant[]> => {
  const response = await axios.get(`/api/participant/${id}`, {
    params: { type, name: searchText },
  });
  return response.data;
};
