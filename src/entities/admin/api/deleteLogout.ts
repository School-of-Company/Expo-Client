import axios from 'axios';

export const deleteLogout = async () => {
  const response = await axios.delete('/api/auth/logout');
  return response;
};
