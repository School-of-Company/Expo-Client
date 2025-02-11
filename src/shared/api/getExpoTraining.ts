import axios from 'axios';
import { ExpoTrainingDetail } from '../types/expo-detail/type';

export const getExpoTraining = async (
  id: number,
): Promise<ExpoTrainingDetail[]> => {
  const response = await axios.get(`/api/training/program/${id}`);
  return response.data;
};
