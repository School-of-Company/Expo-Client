import { AxiosInstance } from 'axios';
import { toApiError } from '../libs/http/apiError';
import clientInstance from '../libs/http/clientInstance';
import clientTokenInstance from '../libs/http/clientTokenInstance';
import { Program } from '../types/program/list/type';

const fetchStandardProgram = async (
  instance: AxiosInstance,
  id: string,
): Promise<Program[]> => {
  try {
    const response = await instance.get(
      `/standard/program/${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '참가자 프로그램 불러오기 실패');
  }
};

/** 관리자 화면용. 관리자 토큰을 붙여 보낸다 */
export const getStandardProgram = (id: string) =>
  fetchStandardProgram(clientTokenInstance, id);

/** 참가자 신청 화면처럼 로그인 없이 쓰는 화면용 */
export const getPublicStandardProgram = (id: string) =>
  fetchStandardProgram(clientInstance, id);
