import axios from 'axios';

interface SignUpData {
  name: string;
  nickname: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export const postSignup = async (data: SignUpData) => {
  const response = await axios.post('/api/auth/signup', data);
  return response;
};
