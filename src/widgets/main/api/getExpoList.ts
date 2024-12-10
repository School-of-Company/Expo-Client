import axios from 'axios';
import { ExpoItem } from '@/shared/types/Expo/type';

export const getExpoList = async (): Promise<ExpoItem[]> => {
  const response = await axios.get('/api/expo');
  return response.data;
};
