import axios from 'axios';

interface CreateExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
}

export const createExhibition = async (data: CreateExhibitionData) => {
  try {
    const response = await axios.post('/api/expo', data);
    return response.data;
  } catch (error) {
    console.error('Error creating exhibition:', error);
    throw error;
  }
};
