import axios from 'axios';
import {
  StandardProgram,
  TrainingProgram,
} from '@/shared/types/program-detail/type';

export const getTrainingProgramDetail = async (
  id: number,
): Promise<TrainingProgram[]> => {
  try {
    const response = await axios.get(`/api/server/token/training/${id}`);
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
    const response = await axios.get(`/api/server/token/standard/${id}`);
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
