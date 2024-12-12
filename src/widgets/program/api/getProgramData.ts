import axios from 'axios';
import { Program } from '@/shared/types/program/type';

export const getTrainingProgram = async (id: string): Promise<Program[]> => {
  const response = await axios.get(`/api/training/program/${id}`);
  return response.data;
};

export const getStandardProgram = async (id: string): Promise<Program[]> => {
  const response = await axios.get(`/api/standard/program/${id}`);
  return response.data;
};
