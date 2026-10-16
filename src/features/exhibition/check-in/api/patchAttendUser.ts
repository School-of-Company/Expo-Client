import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import {
  AttendUserQrRequest,
  AttendUserResponse,
} from '@/shared/types/exhibition/check-in/type';
import { scannerNameConfig } from './scannerNameHeader';

export const patchAttendUser = async (
  id: string,
  data: AttendUserQrRequest,
  scannerName?: string,
): Promise<AttendUserResponse> => {
  try {
    const response = await clientTokenInstance.patch(
      `/attendance/${encodeURIComponent(id)}`,
      data,
      scannerNameConfig(scannerName),
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(getScanErrorMessage(error, 'QR스캔에 실패했습니다.'));
    }
    throw error;
  }
};
