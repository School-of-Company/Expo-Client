import https from 'https';
import axios from 'axios';

// Gateway 주소는 서버에서만 쓴다. 배포 환경에 BASE_URL 이 생기기 전까지는 기존 값을 쓴다
export const GATEWAY_URL =
  process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

// 일반 요청은 10초, 엑셀처럼 서버가 파일을 만드는 요청은 더 오래 기다린다
export const DEFAULT_TIMEOUT_MS = 10_000;
export const FILE_DOWNLOAD_TIMEOUT_MS = 60_000;

export const serverInstance = axios.create({
  baseURL: GATEWAY_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  // 프록시 요청마다 TLS 핸드셰이크를 다시 하지 않도록 연결을 재사용한다
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 50 }),
});
