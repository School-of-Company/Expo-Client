import https from 'https';
import axios from 'axios';

export const serverInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
