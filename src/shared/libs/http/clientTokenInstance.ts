import axios from 'axios';

const clientTokenInstance = axios.create({
  baseURL: '/api/server/token',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

clientTokenInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.response.data.isRefreshError
    ) {
      window.location.href = '/signin';
    }

    return Promise.reject(error);
  },
);

export default clientTokenInstance;
