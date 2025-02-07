import axios from 'axios';
import { ExpoItem } from '@/shared/types/main/type';

export const getExpoList = async (): Promise<ExpoItem[]> => {
  const response = await axios.get('/api/expo');
  return response.data;
};
