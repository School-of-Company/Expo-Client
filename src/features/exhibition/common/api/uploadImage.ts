import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

export const uploadImage = async (file: File | null | string) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await clientTokenInstance.post('/image', formData);
    return response.data.imageURL;
  } catch (error) {
    throw toApiError(error, '이미지를 올리지 못했습니다.');
  }
};
