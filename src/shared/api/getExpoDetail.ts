import axios from 'axios';
import { ExpoDetail } from '../types/expo-detail/type';

export const getExpoDetail = async (id: number): Promise<ExpoDetail> => {
  const response = await axios.get(`/api/expo/${id}`);
  return response.data;
};
