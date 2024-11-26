import { toast } from 'react-toastify';
import { convertAddressToCoordinates } from '../api/convertAddressToCoordinates';
import { createExhibition } from '../api/createExhibition';
import { createTraining } from '../api/createTraining';
import { uploadImage } from '../api/uploadImage';
import { ExhibitionFormData } from '../types/type';

export const handleExhibitionFormSubmit = async (data: ExhibitionFormData) => {
  const coordinates = await convertAddressToCoordinates(data.address);
  if (!coordinates) {
    toast.error('주소 변환에 실패했습니다.');
    return;
  }
  const { lat, lng } = coordinates;
  const img = await uploadImage(data.image);
  if (!lat || !lng || !img) {
    toast.error('필수 정보가 누락되었습니다.');
    return;
  }
  const response = await createExhibition({
    title: data.title,
    description: data.introduction,
    startedDay: data.startedDay,
    finishedDay: data.finishedDay,
    location: data.location,
    coverImage: img,
    x: lng,
    y: lat,
  });
  await createTraining(response.expoId, data.trainings);
};
