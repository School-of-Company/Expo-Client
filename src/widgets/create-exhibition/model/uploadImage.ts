import axios from 'axios';
import { toast } from 'react-toastify';

export const uploadImage = async (file: File | null) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append('image', file);

    const imageURL = await axios.post('/api/image', formData);
    return imageURL;
  } catch (error) {
    toast.error('이미지 업로드 중 오류가 발생했습니다.');
    return null;
  }
};
