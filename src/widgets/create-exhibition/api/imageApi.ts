import { apiClient } from '@/shared/libs/apiClient';

export const uploadImageToApi = async (formData: FormData) => {
  const response = await apiClient.post('/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.imageURL;
};
