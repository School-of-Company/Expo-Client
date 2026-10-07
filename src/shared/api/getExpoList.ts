import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ExpoItem } from '@/shared/types/admin/type';

export const getExpoList = async (): Promise<ExpoItem[]> => {
  try {
    const response = await clientTokenInstance.get('/expo');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 불러오기 실패');
    }
    throw error;
  }
};

export interface ExpoPage {
  content: ExpoItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export const getExpoPage = async (
  page: number,
  size = 20,
): Promise<ExpoPage> => {
  try {
    const response = await clientTokenInstance.get('/expo', {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 불러오기 실패');
    }
    throw error;
  }
};
