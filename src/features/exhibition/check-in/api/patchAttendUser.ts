import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import {
  AttendUserQrRequest,
  AttendUserResponse,
} from '@/shared/types/exhibition/check-in/type';

export const patchAttendUser = async (
  id: string,
  data: AttendUserQrRequest,
): Promise<AttendUserResponse> => {
  try {
    const response = await clientTokenInstance.patch(`/attendance/${id}`, data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(getScanErrorMessage(error, 'QR스캔에 실패했습니다.'));
    }
    throw error;
  }
};
