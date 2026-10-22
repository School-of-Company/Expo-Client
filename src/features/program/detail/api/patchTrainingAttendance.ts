import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import {
  PatchTrainingProgramData,
  ProgramScanResponse,
} from '@/shared/types/program/detail/type';

export const patchTrainingAttendance = async ({
  expoId,
  programId,
  traineeId,
  participantId,
  code,
}: PatchTrainingProgramData): Promise<ProgramScanResponse> => {
  try {
    // 예전 서버는 본문 없는 200을 준다
    const response = await clientTokenInstance.patch<ProgramScanResponse>(
      `/attendance/training/${encodeURIComponent(programId)}`,
      // 연수자 QR은 traineeId, 사전등록 참가자 QR은 participantId와 code를 보낸다
      participantId && code
        ? { expoId, participantId, code }
        : { expoId, traineeId },
    );
    return response.data || {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(getScanErrorMessage(error, '연수 프로그램 QR인식 실패'));
    }
    throw error;
  }
};
