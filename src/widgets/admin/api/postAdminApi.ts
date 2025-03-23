import axios from 'axios';

export const approveSignupApi = async (id: number): Promise<void> => {
  try {
    await axios.patch(`/api/admin/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '회원가입 승인 실패');
    }
    throw error;
  }
};

export const rejectSignupApi = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/api/admin/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '회원가입 거절 실패');
    }
    throw error;
  }
};
