import axios from 'axios';
import { toast } from 'react-toastify';

export const postSendSms = async (phoneNumber: string) => {
  if (!phoneNumber) {
    toast.error('전화번호를 입력해주세요.');
    return;
  }

  const response = await axios.post('/api/auth/sms', { phoneNumber });
  return response;
};
