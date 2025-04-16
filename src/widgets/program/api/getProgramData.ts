import axios from 'axios';
import clientTokenInstance from '@/shared/libs/clientTokenInstance';
import { Program } from '@/shared/types/program/type';

export const getTrainingProgram = async (id: string): Promise<Program[]> => {
  try {
    const response = await clientTokenInstance.get(`/training/program/${id}`);
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

export const getStandardProgram = async (id: string): Promise<Program[]> => {
  try {
    const response = await clientTokenInstance.get(`/standard/program/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '참가자 프로그램 불러오기 실패',
      );
    }
    throw error;
  }
};
