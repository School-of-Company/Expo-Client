import axios from 'axios';

export const deleteExpoApi = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/api/expo/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '회원가입 거절 실패');
    }
    throw error;
  }
};
