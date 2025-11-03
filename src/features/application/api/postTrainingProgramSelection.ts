import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

export interface TrainingProgramSelectionRequest {
  informationJson: string;
  personalInformationStatus: boolean;
  trainingProIds: number[];
}

export const postTrainingProgramSelection = async (
  expoId: string,
  data: TrainingProgramSelectionRequest,
) => {
  try {
    const response = await clientInstance.post(
      `/training/application/list/trainee/${expoId}`,
      data,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response)
      throw new Error(error.response.data.error || '연수 프로그램 신청 실패');
    throw error;
  }
};
