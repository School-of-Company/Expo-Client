import axios from 'axios';
import { ExpoStandard } from '../types/expo-detail/type';

export const getExpoStandard = async (id: number): Promise<ExpoStandard[]> => {
  const response = await axios.get(`/api/standard/program/${id}`);
  return response.data;
};
