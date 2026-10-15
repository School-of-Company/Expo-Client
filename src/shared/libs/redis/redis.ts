import Redis from 'ioredis';

// Redis 가 응답하지 않아도 토큰 재발급이 오래 멈추지 않도록 빨리 실패하게 한다.
// 첫 명령을 보낼 때 연결해, 빌드나 Redis 를 쓰지 않는 요청에서 연결을 열지 않는다
export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
  connectTimeout: 2_000,
  commandTimeout: 2_000,
  maxRetriesPerRequest: 1,
});
