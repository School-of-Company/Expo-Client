import axios from 'axios';

interface standardData {
  title: string;
  startedAt: string;
  endedAt: string;
}

export const createStandard = async (
  expoId: string,
  trainings: standardData[],
) => {
  try {
    const response = await axios.post(
      `/api/standard/list/${expoId}`,
      trainings,
    );
    return response.data;
  } catch (error) {
    console.error('Error creating stabdard:', error);
    throw error;
  }
};
