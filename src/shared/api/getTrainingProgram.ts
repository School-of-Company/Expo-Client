import axios, { AxiosInstance } from 'axios';
import clientInstance from '../libs/http/clientInstance';
import clientTokenInstance from '../libs/http/clientTokenInstance';
import { Program } from '../types/program/list/type';

const fetchTrainingProgram = async (
  instance: AxiosInstance,
  id: string,
): Promise<Program[]> => {
  try {
    const response = await instance.get(`/training/program/${id}`);
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

/** 참가자 신청 폼처럼 로그인 없이 쓰는 화면용 */
export const getTrainingProgram = (id: string) =>
  fetchTrainingProgram(clientInstance, id);

/** 관리자 화면용. 관리자 토큰을 붙여 보낸다 */
export const getAdminTrainingProgram = (id: string) =>
  fetchTrainingProgram(clientTokenInstance, id);
