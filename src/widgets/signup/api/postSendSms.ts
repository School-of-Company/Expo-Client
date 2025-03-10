import axios from 'axios';
import { toast } from 'react-toastify';

export const postSendSms = async (phoneNumber: string) => {
  try {
    if (!phoneNumber) {
      toast.error('전화번호를 입력해주세요.');
      return;
    }

    const response = await axios.post('/api/auth/sms', { phoneNumber });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '문자 매시지 전송에 실패했습니다.',
      );
    }
    throw error;
  }
};
