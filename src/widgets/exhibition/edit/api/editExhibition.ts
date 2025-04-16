import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { EditExhibitionData } from '@/shared/types/exhibition/edit/type';

export const editExhibition = async (data: EditExhibitionData, id: number) => {
  try {
    await clientTokenInstance.patch(`/expo/${id}`, data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 수정 실패');
    }
    throw error;
  }
};
