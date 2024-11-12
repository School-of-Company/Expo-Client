import { apiClient } from '@/shared/libs/apiClient';

export const uploadImageToApi = async (formData: FormData, token: string) => {
  const response = await apiClient.post('/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.imageURL;
};
