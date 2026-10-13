import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';

/** 2xx 응답이면 인증 성공. 실패하면 서버 문구를 담은 Error 를 던진다 */
export const getCheckSmsCode = async (phoneNumber: string, code: string) => {
  if (!phoneNumber || !code) {
    throw new Error('전화번호와 인증 번호를 입력해주세요.');
  }

  try {
    // GET /sms?code= 는 인증번호가 접근 로그에 남아 서버에서 지원 중단(deprecated)됐다
    await clientInstance.post('/sms/verify', { phoneNumber, code });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.error;
      throw new Error(
        typeof message === 'string' && message
          ? message
          : '인증 번호 확인에 실패했습니다.',
      );
    }
    throw error;
  }
};
