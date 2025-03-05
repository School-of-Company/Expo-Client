import axios from 'axios';

interface SignInData {
  nickname: string;
  password: string;
}

export const postSignin = async (data: SignInData) => {
  try {
    const response = await axios.post('/api/auth/signin', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '로그인에 실패했습니다.');
    }
    throw error;
  }
};
