import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const getCheckSmsCode = async (phoneNumber: string, code: string) => {
  if (!phoneNumber || !code) {
    toast.error('전화번호와 인증 번호를 입력해주세요.');
    return;
  }

  try {
    const response = await axios.get(
      `/api/auth/sms?phoneNumber=${phoneNumber}&code=${code}`,
    );
    if (response.status === 200) {
      toast.success('인증 번호 확인에 성공했습니다.');
      return true;
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    const errorMessage =
      axiosError.response?.data?.error || '인증 번호 확인에 실패했습니다.';
    toast.error(errorMessage);
    return false;
  }
};
