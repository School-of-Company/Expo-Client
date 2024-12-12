import axios from 'axios';
import { ExpoItem, SignUpItem } from '@/shared/types/admin/type';

export const getExpoList = async (): Promise<ExpoItem[]> => {
  const response = await axios.get('/api/expo');
  return response.data;
};

export const getRequestSignUp = async (): Promise<SignUpItem[]> => {
  const response = await axios.get('/api/admin');
  return response.data;
};
