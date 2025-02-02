import axios from 'axios';
import { AdminData, ExpoItem, SignUpItem } from '@/shared/types/admin/type';

export const getExpoList = async (): Promise<ExpoItem[]> => {
  const response = await axios.get('/api/expo');
  return response.data;
};

export const getRequestSignUp = async (): Promise<SignUpItem[]> => {
  const response = await axios.get('/api/admin');
  return response.data;
};

export const getAdminData = async (): Promise<AdminData> => {
  const response = await axios.get('/api/admin/my');
  return response.data;
};
