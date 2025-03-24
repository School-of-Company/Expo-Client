import axios from 'axios';

export const deleteExpoApi = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/api/server/expo/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '박람회 삭제 실패');
    }
    throw error;
  }
};
