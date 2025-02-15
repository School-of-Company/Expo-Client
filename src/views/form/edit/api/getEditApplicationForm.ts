import axios from 'axios';

export const getEditApplicationForm = async (id: string, type: string) => {
  const response = await axios.get(`/api/form/${id}?type=${type}`);
  return response.data;
};
