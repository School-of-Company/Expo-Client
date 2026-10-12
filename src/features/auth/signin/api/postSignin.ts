import axios from 'axios';

interface SignInData {
  nickname: string;
  password: string;
}

export class SigninError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'SigninError';
  }
}

const parseRetryAfter = (value: unknown) => {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
};

export const postSignin = async (data: SignInData) => {
  try {
    const response = await axios.post('/api/auth/signin', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new SigninError(
        error.response.data?.error || '로그인에 실패했습니다.',
        error.response.status,
        parseRetryAfter(error.response.headers['retry-after']),
      );
    }
    throw error;
  }
};
