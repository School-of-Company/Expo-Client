import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';

// 현장 종이 QR 입장. 같은 토큰은 하루에 한 번만 입장된다
export const patchPaperQrAttendance = async (expoId: string, token: string) => {
  try {
    await clientTokenInstance.patch(
      `/attendance/qr/${encodeURIComponent(expoId)}`,
      { token },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 400은 '이미 입장'과 '진행 중인 박람회가 아님'이 모두 와서 서버 문구를 그대로 보여 준다
      throw new Error(
        getScanErrorMessage(error, '종이 QR 입장에 실패했습니다.'),
      );
    }
    throw error;
  }
};
