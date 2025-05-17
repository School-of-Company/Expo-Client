import axios from 'axios';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { convertAddressToCoordinates } from '../api/convertAddressToCoordinates';
import { uploadImage } from '../api/uploadImage';
import { createExhibition } from '../create/api/createExhibition';

export const handleCreateExhibitionFormSubmit = async (
  data: ExhibitionFormData,
) => {
  try {
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
      x: lng,
      y: lat,
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
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 생성 실패');
    }
    throw error;
  }
};
