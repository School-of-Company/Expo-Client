import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.NEXT_PUBLIC_REDIS_HOST,
  port: Number(process.env.NEXT_PUBLIC_REDIS_PORT),
  password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
});
