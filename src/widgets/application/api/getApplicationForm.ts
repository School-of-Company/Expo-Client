import axios from 'axios';

export const getApplicationForm = async (id: string, userType: string) => {
  const response = await axios.get(`/api/form/${id}?type=${userType}`);
  return response.data;
};
