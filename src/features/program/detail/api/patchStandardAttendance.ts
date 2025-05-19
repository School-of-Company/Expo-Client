import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { PatchStandardProgramData } from '@/shared/types/program/detail/type';

export const patchStandardAttendance = async ({
  programId,
  participantId,
  phoneNumber,
}: PatchStandardProgramData) => {
  try {
    const response = await clientTokenInstance.patch(
      `/attendance/standard/${programId}`,
      {
        participantId,
        phoneNumber,
      },
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'QR코드 스캔 실패');
    }
    throw error;
  }
};
