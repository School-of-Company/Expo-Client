import axios from 'axios';
import { getRefresh } from './getRefresh';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
apiClient.interceptors.response.use(function (response) {
  return response;
}, getRefresh);
