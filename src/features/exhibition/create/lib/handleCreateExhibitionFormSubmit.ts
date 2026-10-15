import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { convertAddressToCoordinates } from '../../common/api/convertAddressToCoordinates';
import { uploadImage } from '../../common/api/uploadImage';
import { createExhibition } from '../api/createExhibition';

export const handleCreateExhibitionFormSubmit = async (
  data: ExhibitionFormData,
) => {
  // 호출하는 API 함수가 이미 오류를 ApiError·Error 로 바꿔 던지므로 그대로 올린다
  const coordinates = await convertAddressToCoordinates(data.address);

  const { lat, lng } = coordinates;

  const img = await uploadImage(data.image);

  const formattedData = {
    title: data.title,
    description: data.introduction,
    startedDay: data.startedDay,
    finishedDay: data.finishedDay,
    location: data.location,
    coverImage: img,
    x: String(lng),
    y: String(lat),
    addStandardProRequestDto: data.standard.map((standard) => ({
      title: standard.title,
      startedAt: `${standard.startedAt}`,
      endedAt: `${standard.endedAt}`,
    })),
    addTrainingProRequestDto: data.trainings.map((training) => ({
      title: training.title,
      startedAt: `${training.startedAt}`,
      endedAt: `${training.endedAt}`,
      category: training.category ?? 'CHOICE',
    })),
  };

  const response = await createExhibition(formattedData);
  return response.expoId;
};
