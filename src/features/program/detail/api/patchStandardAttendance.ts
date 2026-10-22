import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import {
  PatchStandardProgramData,
  ProgramScanResponse,
} from '@/shared/types/program/detail/type';

export const patchStandardAttendance = async ({
  expoId,
  programId,
  participantId,
  code,
}: PatchStandardProgramData): Promise<ProgramScanResponse> => {
  try {
    // 예전 서버는 본문 없는 200을 준다
    const response = await clientTokenInstance.patch<ProgramScanResponse>(
      `/attendance/standard/${encodeURIComponent(programId)}`,
      // code가 없으면 키 자체를 빼고 보낸다
      code === undefined
        ? { expoId, participantId }
        : { expoId, participantId, code },
    );
    return response.data || {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(getScanErrorMessage(error, 'QR코드 스캔 실패'));
    }
    throw error;
  }
};
