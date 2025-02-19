import axios from 'axios';

export const getEditSurveyForm = async (id: string, type: string) => {
  const response = await axios.get(`/api/survey/${id}?type=${type}`);
  return response.data;
};
