import axios from 'axios';

export const deleteUserAccount = async () => {
  try {
    const response = await axios.delete('/api/admin');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '유저 탈퇴 실패');
    }
    throw error;
  }
};
