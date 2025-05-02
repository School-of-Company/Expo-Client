import type Redis from 'ioredis';

let redis: Redis;

if (typeof window === 'undefined') {
  const Redis = require('ioredis');
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });
} else {
  throw new Error('Redis should never be imported on the client.');
}

export { redis };
