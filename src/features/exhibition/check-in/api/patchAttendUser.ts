import axios, { AxiosInstance } from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { toScanError } from '@/shared/libs/http/getScanErrorMessage';
import {
  AttendUserQrRequest,
  AttendUserResponse,
} from '@/shared/types/exhibition/check-in/type';
import { scannerNameConfig } from './scannerNameHeader';

export const patchAttendUser = async (
  id: string,
  data: AttendUserQrRequest,
  scannerName?: string,
  http: AxiosInstance = clientTokenInstance,
): Promise<AttendUserResponse> => {
  try {
    const response = await http.patch(
      `/attendance/${encodeURIComponent(id)}`,
      data,
      scannerNameConfig(scannerName),
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw toScanError(error, 'QR스캔에 실패했습니다.');
    }
    throw error;
  }
};
