import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  StandardProgram,
  TrainingProgram,
} from '@/shared/types/program/detail/type';

export const getTrainingProgramDetail = async (
  id: string,
): Promise<TrainingProgram[]> => {
  try {
    const response = await clientTokenInstance.get(
      `/training/${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '연수 프로그램 상세 보기 실패');
  }
};

export const getStandardProgramDetail = async (
  id: string,
): Promise<StandardProgram[]> => {
  try {
    const response = await clientTokenInstance.get(
      `/standard/${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '참가자 프로그램 상세 보기 실패');
  }
};
