import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

const PAPER_QR_ERROR_MESSAGES: Record<number, string> = {
  400: '오늘 이미 입장한 종이 QR입니다.',
  404: '등록되지 않은 종이 QR입니다. 다른 박람회의 QR인지 확인해 주세요.',
};

// 현장 종이 QR 입장. 같은 토큰은 하루에 한 번만 입장된다
export const patchPaperQrAttendance = async (expoId: string, token: string) => {
  try {
    await clientTokenInstance.patch(`/attendance/qr/${expoId}`, { token });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        PAPER_QR_ERROR_MESSAGES[error.response.status] ||
          error.response.data?.error ||
          '종이 QR 입장에 실패했습니다.',
      );
    }
    throw error;
  }
};
