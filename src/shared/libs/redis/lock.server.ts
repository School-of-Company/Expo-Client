import Redlock, { Lock } from 'redlock';
import { redis } from './redis.server';

export const redlock = new Redlock([redis], {
  driftFactor: 0.01,
  retryCount: 5,
  retryDelay: 200,
  retryJitter: 200,
});

export type RedlockLock = Lock;
