import axios from 'axios';

export const getApplicationForm = async (id: string, userType: string) => {
  try {
    const response = await axios.get(`/api/server/form/${id}?type=${userType}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '신청 폼 불러오기 실패');
    }
    throw error;
  }
};
