import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { convertAddressToCoordinates } from '../../common/api/convertAddressToCoordinates';
import { uploadImage } from '../../common/api/uploadImage';
import { editExhibition } from '../api/editExhibition';

export const handleEditExhibitionFormSubmit = async (
  data: ExhibitionFormData,
  id: string,
) => {
  // 호출하는 API 함수가 이미 오류를 ApiError·Error 로 바꿔 던지므로 그대로 올린다
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
    x: String(lng),
    y: String(lat),
    // 새로 추가한 프로그램은 서버 계약상 id를 null로 보낸다.
    // 기존 프로그램은 조회한 revision을 돌려보내고, policy는 null로 보내 기존 정책을 유지한다
    updateStandardProRequestDto: data.standard.map((standard) => ({
      id: standard.id ?? null,
      title: standard.title,
      startedAt: `${standard.startedAt}`,
      endedAt: `${standard.endedAt}`,
      policy: null,
      revision: standard.revision ?? null,
    })),
    updateTrainingProRequestDto: data.trainings.map((training) => ({
      id: training.id ?? null,
      title: training.title,
      startedAt: `${training.startedAt}`,
      endedAt: `${training.endedAt}`,
      category: training.category ?? 'CHOICE',
      policy: null,
      revision: training.revision ?? null,
    })),
  };

  await editExhibition(formattedData, id);

  return id;
};
