import axios from 'axios';

interface TrainingData {
  title: string;
  startedAt: string;
  endedAt: string;
  category?: 'ESSENTIAL' | 'CHOICE';
}

export const createTraining = async (
  expoId: string,
  trainings: TrainingData[],
) => {
  try {
    const response = await axios.post(
      `/api/training/list/${expoId}`,
      trainings,
    );
    return response.data;
  } catch (error) {
    console.error('Error creating trainings:', error);
    throw error;
  }
};
