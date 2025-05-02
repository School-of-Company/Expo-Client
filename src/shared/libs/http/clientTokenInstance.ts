import axios from 'axios';

const clientTokenInstance = axios.create({
  baseURL: '/api/server/token',
  withCredentials: true,
});

clientTokenInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.response.data?.isRefreshError
    ) {
      if (config?.skipAuthRedirect) {
        return Promise.reject(error);
      }

      window.location.href = '/signin';
      return;
    }

    return Promise.reject(error);
  },
);

export default clientTokenInstance;
