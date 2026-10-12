import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import { SignUpData } from '@/shared/types/signup/type';

// 서버 SignUpReqDto 에 있는 필드만 보낸다. 비밀번호 확인·인증번호는 화면에서만 쓴다
export const postSignup = async ({
  name,
  nickname,
  email,
  password,
  phoneNumber,
}: SignUpData) => {
  try {
    const response = await clientInstance.post('/auth', {
      name,
      nickname,
      email,
      password,
      phoneNumber,
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '회원가입에 실패했습니다.');
    }
    throw error;
  }
};
