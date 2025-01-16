import axios from 'axios';

export const deleteUserAccount = async () => {
  const response = await axios.delete('/api/admin');
  return response;
};
