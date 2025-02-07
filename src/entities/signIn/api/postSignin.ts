import axios from 'axios';

interface SignInData {
  nickname: string;
  password: string;
}

export const postSignin = async (data: SignInData) => {
  const response = await axios.post('/api/auth/signin', data);
  return response;
};
