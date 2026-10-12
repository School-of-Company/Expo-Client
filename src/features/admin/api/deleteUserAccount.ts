import axios from 'axios';

export const deleteUserAccount = async () => {
  try {
    const response = await axios.delete('/api/auth/deleteUserAccount');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 로그인이 만료되어 서버가 쿠키를 지웠으면 다시 로그인하게 한다
      if (error.response.status === 401) window.location.href = '/signin';
      throw new Error(error.response.data.error || '유저 탈퇴 실패');
    }
    throw error;
  }
};
