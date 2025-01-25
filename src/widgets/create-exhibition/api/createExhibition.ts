import axios from 'axios';
import { CreateExhibitionData } from '@/shared/types/create-exhibition/type';

export const createExhibition = async (data: CreateExhibitionData) => {
  try {
    const response = await axios.post('/api/expo', data);
    return response.data;
  } catch (error) {
    console.error('Error creating exhibition:', error);
    throw error;
  }
};
