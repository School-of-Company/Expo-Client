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
  if (response.status === 200) {
    toast.success('인증 번호 확인에 성공했습니다.');
    return true;
  } else {
    toast.error('인증 번호 확인에 실패했습니다.');
    return false;
  }
};
