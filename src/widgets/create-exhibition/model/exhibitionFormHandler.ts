import axios from 'axios';
import { toast } from 'react-toastify';
import { ExhibitionFormData } from '../types/type';
import { handleChageDate } from './changeDate';
import { convertAddressToCoordinates } from './convertAddressToCoordinates';
import { uploadImage } from './uploadImage';

export const handleExhibitionFormSubmit = async (data: ExhibitionFormData) => {
  const coordinates = await convertAddressToCoordinates(data.address);
  if (!coordinates) {
    toast.error('주소 변환에 실패했습니다.');
    return;
  }

  const { lat, lng } = coordinates;
  const { startedDay, finishedDay } = await handleChageDate(data.day);
  const img = await uploadImage(data.image);

  if (!lat || !lng || !startedDay || !finishedDay || !img) {
    toast.error('필수 정보가 누락되었습니다.');
    return;
  }

  try {
    const response = await axios.post('/api/expo', {
      title: data.title,
      description: data.introduction,
      startedDay,
      finishedDay,
      location: data.location,
      coverImage: img,
      x: lng,
      y: lat,
    });
    console.log('서버 응답:', response);

    toast.success('Data successfully posted!');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to post data');
  }
};
