import axios from 'axios';
import { ExpoItem } from '@/shared/types/main/type';

export const getExpoList = async (): Promise<ExpoItem[]> => {
  try {
    const response = await axios.get('/api/expo');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};
