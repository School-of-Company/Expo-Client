import axios from 'axios';

export const getSurveyForm = async (expoId: string, userType: string) => {
  const response = await axios.get(`/api/survey/${expoId}?type=${userType}`);
  return response.data;
};
