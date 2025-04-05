import axios from 'axios';

export const getEditSurveyForm = async (id: string, type: string) => {
  try {
    const response = await axios.get(`/api/server/survey/${id}?type=${type}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '만족도 조사 폼 불러오기 실패',
      );
    }
    throw error;
  }
};
