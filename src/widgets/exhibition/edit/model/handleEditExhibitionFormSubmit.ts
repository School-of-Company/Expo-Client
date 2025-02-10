import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { generateUniqueId } from '@/entities/exhibition/model/generateUniqueId';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';
import { convertAddressToCoordinates } from '../../api/convertAddressToCoordinates';
import { uploadImage } from '../../api/uploadImage';
import { editExhibition } from '../api/editExhibition';

export const handleEditExhibitionFormSubmit = async (
  data: ExhibitionFormData,
  router: ReturnType<typeof useRouter>,
  queryClient: QueryClient,
  id: number,
) => {
  try {
    const coordinates = await convertAddressToCoordinates(data.address);
    if (!coordinates) {
      toast.error('주소 변환에 실패했습니다.');
      throw new Error('Failed to convert address to coordinates.');
    }
    const { lat, lng } = coordinates;

    let coverImage: string;
    if (typeof data.image === 'string') {
      coverImage = data.image;
    } else {
      coverImage = await uploadImage(data.image);
    }

    if (!lat || !lng || !coverImage) {
      toast.error('필수 정보가 누락되었습니다.');
      throw new Error('Missing required information.');
    }

    const formattedData = {
      title: data.title,
      description: data.introduction,
      startedDay: data.startedDay,
      finishedDay: data.finishedDay,
      location: data.location,
      coverImage: coverImage,
      x: lat,
      y: lng,
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
    console.error(error);
    throw error;
  }
};
