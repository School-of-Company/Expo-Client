// src/utils/checkSmsCode.ts
import axios from 'axios';
import { toast } from 'react-toastify';

export const checkSmsCode = async (phoneNumber: string, code: string) => {
  if (!phoneNumber || !code) {
    toast.error('전화번호와 인증 번호를 입력해주세요.');
    return;
  }

  try {
    const response = await axios.get(
      `/api/auth/sms?phoneNumber=${phoneNumber}&code=${code}`,
    );
    if (response.status === 200) {
      toast.success('인증번호가 확인되었습니다.');
    }
  } catch (error) {
    console.error('Code verification failed', error);
    toast.error('인증번호 확인에 실패했습니다.');
  }
};
