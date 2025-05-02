import type { Lock } from 'redlock';

let redlock: InstanceType<typeof Redlock>;
let Redlock: typeof import('redlock').default;

if (typeof window === 'undefined') {
  const redlockModule = require('redlock');
  Redlock = redlockModule.default;
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
