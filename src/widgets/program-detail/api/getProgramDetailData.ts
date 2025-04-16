import axios from 'axios';
import clientTokenInstance from '@/shared/libs/clientTokenInstance';
import {
  StandardProgram,
  TrainingProgram,
} from '@/shared/types/program-detail/type';

export const getTrainingProgramDetail = async (
  id: number,
): Promise<TrainingProgram[]> => {
  try {
    const response = await clientTokenInstance.get(`/training/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '연수 프로그램 상세 보기 실패',
      );
    }
    throw error;
  }
};

export const getStandardProgramDetail = async (
  id: number,
): Promise<StandardProgram[]> => {
  try {
    const response = await clientTokenInstance.get(`/standard/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '참가자 프로그램 상세 보기 실패',
      );
    }
    throw error;
  }
};
