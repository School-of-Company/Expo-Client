import { apiClient } from '@/shared/libs/apiClient';

interface PostExpoData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
}

export const postExhibition = async (data: PostExpoData) => {
  const response = await apiClient.post('/expo', data, {});
  return response.data;
};
