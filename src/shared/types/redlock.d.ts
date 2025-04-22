declare module 'redlock' {
  import { EventEmitter } from 'events';
  import { Redis } from 'ioredis';

  export interface Lock {
    resource: string;
    value: string;
    expiration: number;
    extend(ttl: number): Promise<Lock>;
    release(): Promise<void>;
  }

  interface RedlockOptions {
    driftFactor?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
    automaticExtensionThreshold?: number;
  }

  export default class Redlock extends EventEmitter {
    constructor(clients: Redis[], options?: RedlockOptions);
    acquire(resource: string | string[], ttl: number): Promise<Lock>;
    using<T>(
      resource: string | string[],
      ttl: number,
      fn: () => Promise<T>,
    ): Promise<T>;
  }
}
