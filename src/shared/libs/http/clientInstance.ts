import axios from 'axios';
import { logProxyFailure } from './proxyFailureLog';

const clientInstance = axios.create({
  baseURL: '/api/server',
  withCredentials: true,
});

clientInstance.interceptors.response.use(undefined, logProxyFailure);

export default clientInstance;
