import axios from 'axios';
import { toast } from 'react-toastify';

export const uploadImage = async (file: File | null | string) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post('/api/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageURL;
  } catch (error) {
    toast.error('이미지 업로드 중 오류가 발생했습니다.');
    return null;
  }
};
