import axios from 'axios';
import { EditExhibitionData } from '@/shared/types/exhibition/edit/type';

export const editExhibition = async (data: EditExhibitionData, id: number) => {
  try {
    await axios.patch(`/api/expo/${id}`, data);
  } catch (error) {
    console.error('Error creating exhibition:', error);
    throw error;
  }
};
