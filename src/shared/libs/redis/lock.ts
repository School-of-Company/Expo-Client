import type { Lock, default as RedlockType } from 'redlock';

let redlock: RedlockType;
let Redlock: typeof RedlockType;

if (typeof window === 'undefined') {
  Redlock = require('redlock');
  const { redis } = require('./redis');
  redlock = new Redlock([redis], {
    driftFactor: 0.01,
    retryCount: 5,
    retryDelay: 200,
    retryJitter: 200,
  });
} else {
  throw new Error('Redlock should never be imported on the client.');
}

export { redlock };
export type RedlockLock = Lock;
