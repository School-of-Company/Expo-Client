import fs from 'fs';
import https from 'https';
import path from 'path';
import axios from 'axios';

const createHttpsAgent = () => {
  try {
    const certPath = path.join(process.cwd(), 'certificate.crt');
    const ca = fs.readFileSync(certPath);
    return new https.Agent({
      ca,
      rejectUnauthorized: true,
    });
  } catch (error) {
    return new https.Agent({
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    });
  }
};

export const serverInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  httpsAgent: createHttpsAgent(),
});
