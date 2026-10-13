import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import { PatchStandardProgramData } from '@/shared/types/program/detail/type';

export const patchStandardAttendance = async ({
  expoId,
  programId,
  participantId,
  code,
}: PatchStandardProgramData): Promise<void> => {
  try {
    await clientTokenInstance.patch(
      `/attendance/standard/${encodeURIComponent(programId)}`,
      {
        expoId,
        participantId,
        code,
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(getScanErrorMessage(error, 'QR코드 스캔 실패'));
    }
    throw error;
  }
};
