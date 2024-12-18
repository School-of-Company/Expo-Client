import axios from 'axios';
import { toast } from 'react-toastify';

export const getCheckSmsCode = async (phoneNumber: string, code: string) => {
  if (!phoneNumber || !code) {
    toast.error('전화번호와 인증 번호를 입력해주세요.');
    return;
  }

  const response = await axios.get(
    `/api/auth/sms?phoneNumber=${phoneNumber}&code=${code}`,
  );
  return response;
};
