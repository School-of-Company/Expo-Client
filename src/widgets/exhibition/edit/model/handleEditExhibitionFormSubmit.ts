import axios from 'axios';
import { generateUniqueId } from '@/entities/exhibition/model/generateUniqueId';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { convertAddressToCoordinates } from '../../api/convertAddressToCoordinates';
import { uploadImage } from '../../api/uploadImage';
import { editExhibition } from '../api/editExhibition';

export const handleEditExhibitionFormSubmit = async (
  data: ExhibitionFormData,
  id: string,
) => {
  try {
    const coordinates = await convertAddressToCoordinates(data.address);

    const { lat, lng } = coordinates;

    let coverImage: string;
    if (typeof data.image === 'string') {
      coverImage = data.image;
    } else {
      coverImage = await uploadImage(data.image);
    }

    const formattedData = {
      title: data.title,
      description: data.introduction,
      startedDay: data.startedDay,
      finishedDay: data.finishedDay,
      location: data.location,
      coverImage: coverImage,
      x: lng,
      y: lat,
      updateStandardProRequestDto: data.standard.map((standard) => ({
        id: standard.id || generateUniqueId(),
        title: standard.title,
        startedAt: `${standard.startedAt}`,
        endedAt: `${standard.endedAt}`,
      })),
      updateTrainingProRequestDto: data.trainings.map((training) => ({
        id: training.id || generateUniqueId(),
        title: training.title,
        startedAt: `${training.startedAt}`,
        endedAt: `${training.endedAt}`,
        category: training.category ?? 'CHOICE',
      })),
    };

    await editExhibition(formattedData, id);

    return id;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 수정 실패');
    }
    throw error;
  }
};
