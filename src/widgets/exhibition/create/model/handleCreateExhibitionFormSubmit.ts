import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { convertAddressToCoordinates } from '../../api/convertAddressToCoordinates';
import { uploadImage } from '../../api/uploadImage';
import { createExhibition } from '../api/createExhibition';

export const handleCreateExhibitionFormSubmit = async (
  data: ExhibitionFormData,
  router: ReturnType<typeof useRouter>,
  queryClient: QueryClient,
) => {
  try {
    const coordinates = await convertAddressToCoordinates(data.address);
    if (!coordinates) {
      toast.error('주소 변환에 실패했습니다.');
      throw new Error('Failed to convert address to coordinates.');
    }
    const { lat, lng } = coordinates;

    const img = await uploadImage(data.image);

    if (!lat || !lng || !img) {
      toast.error('필수 정보가 누락되었습니다.');
      throw new Error('Missing required information.');
    }

    const formattedData = {
      title: data.title,
      description: data.introduction,
      startedDay: data.startedDay,
      finishedDay: data.finishedDay,
      location: data.location,
      coverImage: img,
      x: lat,
      y: lng,
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
    if (response) {
      await queryClient.invalidateQueries({ queryKey: ['expoList'] });
      return response.expoId;
    } else {
      throw new Error('Failed to create exhibition.');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
