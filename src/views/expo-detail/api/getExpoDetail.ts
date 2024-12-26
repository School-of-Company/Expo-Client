import axios from 'axios';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/expo-detail/type';

export const getExpoDetail = async (id: number): Promise<ExpoDetail> => {
  const response = await axios.get(`/api/expo/${id}`);
  return response.data;
};

export const getExpoStandard = async (id: number): Promise<ExpoStandard[]> => {
  const response = await axios.get(`/api/standard/program/${id}`);
  return response.data;
};

export const getExpoTraining = async (
  id: number,
): Promise<ExpoTrainingDetail[]> => {
  const response = await axios.get(`/api/training/program/${id}`);
  return response.data;
};
