import { toApiError } from '../libs/http/apiError';
import clientTokenInstance from '../libs/http/clientTokenInstance';
import { Program } from '../types/program/list/type';

export const getStandardProgram = async (id: string): Promise<Program[]> => {
  try {
    const response = await clientTokenInstance.get(
      `/standard/program/${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '참가자 프로그램 불러오기 실패');
  }
};
