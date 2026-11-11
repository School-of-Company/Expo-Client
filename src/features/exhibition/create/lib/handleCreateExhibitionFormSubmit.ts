import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { convertAddressToCoordinates } from '../../common/api/convertAddressToCoordinates';
import { uploadImage } from '../../common/api/uploadImage';
import {
  toPreregisterCapacityBody,
  validatePreregisterCapacity,
} from '../../common/lib/preregisterCapacity';
import { createExhibition } from '../api/createExhibition';
import { applyProgramPolicies } from './programPolicy';
import { createRegistrationForms } from './registrationForm';

export const handleCreateExhibitionFormSubmit = async (
  data: ExhibitionFormData,
) => {
  const capacityError = validatePreregisterCapacity(data);
  if (capacityError) throw new Error(capacityError);

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
    ...toPreregisterCapacityBody(data),
    addStandardProRequestDto: data.standard.map((standard) => ({
      title: standard.title,
      startedAt: `${standard.startedAt}`,
      endedAt: `${standard.endedAt}`,
      place: standard.place,
    })),
    addTrainingProRequestDto: data.trainings.map((training) => ({
      title: training.title,
      startedAt: `${training.startedAt}`,
      endedAt: `${training.endedAt}`,
      place: training.place,
      category: training.category ?? 'CHOICE',
    })),
  };

  const { expoId } = await createExhibition(formattedData);
  // 박람회는 이미 만들어졌으므로 여기서 실패해도 던지지 않는다. 다시 저장하면 박람회가 하나 더 생긴다
  try {
    await createRegistrationForms(expoId, data);
    await applyProgramPolicies(expoId, data);
    return { expoId, policyError: null };
  } catch (error) {
    return { expoId, policyError: error as Error };
  }
};
