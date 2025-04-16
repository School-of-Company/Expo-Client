import axios from 'axios';

const clientInstance = axios.create({
  baseURL: '/api/server',
  withCredentials: true,
});

export default clientInstance;
