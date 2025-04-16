import axios from 'axios';
import clientTokenInstance from '@/shared/libs/clientTokenInstance';

export const uploadImage = async (file: File | null | string) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await clientTokenInstance.post('/image', formData);
    return response.data.imageURL;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '이미지 형식이 올바르지 않습니다',
      );
    }
    throw error;
  }
};
