import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { toScanError } from '@/shared/libs/http/getScanErrorMessage';
import {
  ExitScanRequest,
  ExitScanResponse,
} from '@/shared/types/exhibition/check-in/entry';
import { scannerNameConfig } from './scannerNameHeader';

// 오늘 입장한 참가자·연수자·종이 QR 의 퇴장을 기록한다.
// 입장 기록이 없거나 이미 퇴장했으면 400, 참가자·토큰이 없으면 404 를 서버 문구로 보여 준다
export const patchExitUser = async (
  expoId: string,
  data: ExitScanRequest,
  scannerName?: string,
): Promise<ExitScanResponse> => {
  try {
    const response = await clientTokenInstance.patch<ExitScanResponse>(
      `/attendance/exit/${encodeURIComponent(expoId)}`,
      data,
      scannerNameConfig(scannerName),
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw toScanError(error, '퇴장 처리에 실패했습니다.');
    }
    throw error;
  }
};
