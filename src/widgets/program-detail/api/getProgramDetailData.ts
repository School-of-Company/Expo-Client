import axios from 'axios';
import {
  StandardProgram,
  TrainingProgram,
} from '@/shared/types/program-detail/type';

export const getTrainingProgramDetail = async (
  id: number,
): Promise<TrainingProgram[]> => {
  const response = await axios.get(`/api/training/${id}`);
  return response.data;
};

export const getStandardProgramDetail = async (
  id: number,
): Promise<StandardProgram[]> => {
  const response = await axios.get(`/api/standard/${id}`);
  return response.data;
};
