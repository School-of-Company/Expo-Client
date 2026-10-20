import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { toScanError } from '@/shared/libs/http/getScanErrorMessage';
import { EntryStatusFields } from '@/shared/types/exhibition/check-in/type';
import { scannerNameConfig } from './scannerNameHeader';

// 현장 종이 QR 입장. 퇴장 기록이 있는 토큰을 다시 찍으면 재입장이고, 퇴장 없이 또 찍으면 400 이다
export const patchPaperQrAttendance = async (
  expoId: string,
  token: string,
  scannerName?: string,
): Promise<EntryStatusFields> => {
  try {
    // 예전 서버는 본문 없는 200 을 준다
    const response = await clientTokenInstance.patch(
      `/attendance/qr/${encodeURIComponent(expoId)}`,
      { token },
      scannerNameConfig(scannerName),
    );
    return response.data || {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 400은 '이미 입장'과 '진행 중인 박람회가 아님'이 모두 와서 서버 문구를 그대로 보여 준다
      throw toScanError(error, '종이 QR 입장에 실패했습니다.');
    }
    throw error;
  }
};
