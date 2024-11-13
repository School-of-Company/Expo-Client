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

export const postExhibition = async (data: PostExpoData, token: string) => {
  const response = await apiClient.post('/expo', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
