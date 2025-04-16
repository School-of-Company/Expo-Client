import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  AttendUserQrRequest,
  AttendUserResponse,
} from '@/shared/types/name-tag/type';

export const patchAttendUser = async (
  id: string,
  data: AttendUserQrRequest,
): Promise<AttendUserResponse> => {
  try {
    const response = await clientTokenInstance.patch(`/attendance/${id}`, {
      authority: data.authority,
      phoneNumber: data.phoneNumber,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'QR스캔에 실패했습니다.');
    }
    throw error;
  }
};
