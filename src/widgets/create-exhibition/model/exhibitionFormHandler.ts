import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { convertAddressToCoordinates } from '../api/convertAddressToCoordinates';
import { createExhibition } from '../api/createExhibition';
import { createStandard } from '../api/createStandard';
import { createTraining } from '../api/createTraining';
import { uploadImage } from '../api/uploadImage';
import { ExhibitionFormData } from '../types/type';

export const handleExhibitionFormSubmit = async (
  data: ExhibitionFormData,
  router: ReturnType<typeof useRouter>,
  queryClient: QueryClient,
) => {
  try {
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
      x: lat,
      y: lng,
    });

    if (response) {
      await createTraining(response.expoId, data.trainings);
      await createStandard(response.expoId, data.standard);
      toast.success('박람회가 생성되었습니다.');
      await queryClient.invalidateQueries({ queryKey: ['expoList'] });
      router.push('/');
    } else {
      toast.error('박람회 생성에 실패했습니다.');
    }
  } catch (error) {
    toast.error('박람회 생성에 실패했습니다.');
    console.error(error);
  }
};
