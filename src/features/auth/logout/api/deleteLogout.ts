import axios from 'axios';

export const deleteLogout = async () => {
  try {
    const response = await axios.delete('/api/auth/logout');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '로그아웃 실패');
    }
    throw error;
  }
};
