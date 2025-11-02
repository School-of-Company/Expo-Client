import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

export interface TrainingProgramSelectionRequest {
  trainingId: string;
  trainingProIds: number[];
}

export const postTrainingProgramSelection = async (
  data: TrainingProgramSelectionRequest,
) => {
  try {
    const response = await clientInstance.post(
      '/training/application/list',
      data,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response)
      throw new Error(error.response.data.error || '연수 프로그램 신청 실패');
    throw error;
  }
};
