import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { PatchTrainingProgramData } from '@/shared/types/program-detail/type';

export const patchTrainingAttendance = async ({
  id,
  traineeId,
}: PatchTrainingProgramData) => {
  try {
    const response = await clientTokenInstance.patch(
      `/attendance/training/${id}`,
      {
        traineeId,
      },
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '연수 프로그램 QR인식 필패');
    }
    throw error;
  }
};
