import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import { PatchTrainingProgramData } from '@/shared/types/program/detail/type';

export const patchTrainingAttendance = async ({
  expoId,
  programId,
  traineeId,
  participantId,
  code,
}: PatchTrainingProgramData): Promise<void> => {
  try {
    await clientTokenInstance.patch(
      `/attendance/training/${encodeURIComponent(programId)}`,
      // 연수자 QR은 traineeId, 사전등록 참가자 QR은 participantId와 code를 보낸다
      participantId && code
        ? { expoId, participantId, code }
        : { expoId, traineeId },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(getScanErrorMessage(error, '연수 프로그램 QR인식 실패'));
    }
    throw error;
  }
};
