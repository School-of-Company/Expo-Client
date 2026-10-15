import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import { SignUpData } from '@/shared/types/signup/type';

export class SignupError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'SignupError';
  }
}

// 서버가 가입 직전에 인증번호를 다시 확인하며 돌려주는 상태별 안내. 400(틀린 번호·검증 실패)은 서버 문구를 쓴다
const CODE_STATUS_MESSAGES: Record<number, string> = {
  404: '인증 시간이 지났습니다. 인증 번호를 다시 받아 주세요.',
  429: '인증 시도 횟수를 넘었습니다. 인증 번호를 다시 받아 주세요.',
  503: '인증 서비스에 잠시 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
};

// 서버 SignUpReqDto 에 있는 필드만 보낸다. 비밀번호 확인은 화면에서만 쓴다
export const postSignup = async ({
  name,
  nickname,
  email,
  password,
  phoneNumber,
  code,
}: SignUpData) => {
  try {
    const response = await clientInstance.post('/auth', {
      name,
      nickname,
      email,
      password,
      phoneNumber,
      code,
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      throw new SignupError(
        CODE_STATUS_MESSAGES[status] ||
          data?.error ||
          '회원가입에 실패했습니다.',
        status,
        data?.errors,
      );
    }
    throw error;
  }
};
