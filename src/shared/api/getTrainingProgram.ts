import axios from 'axios';
import clientInstance from '../libs/http/clientInstance';
import { Program } from '../types/program/list/type';

export const getTrainingProgram = async (id: string): Promise<Program[]> => {
  try {
    const response = await clientInstance.get(`/training/program/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '연수 프로그램 불러오기 실패',
      );
    }
    throw error;
  }
};
