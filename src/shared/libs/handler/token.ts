import { redlock, RedlockLock } from '@/shared/libs/redis/lock.server';
import { redis } from '@/shared/libs/redis/redis.server';
import { refreshAccessToken } from './refreshAccessToken';

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

const TOKEN_TTL_SEC = 5;
const POLL_INTERVAL_MS = 100;
const MAX_POLL_MS = 1000;

export async function performTokenRefresh(
  refreshToken: string,
): Promise<RefreshTokenResult | null> {
  const lockKey = `lock:refresh:${refreshToken}`;
  const cacheKey = `rtk:${refreshToken}`;
  let lock: RedlockLock | undefined;

  try {
    lock = await redlock.acquire([lockKey], TOKEN_TTL_SEC * 1000);

    const [cachedAccess, cachedRefresh] = await redis.hmget(
      cacheKey,
      'accessToken',
      'refreshToken',
    );
    if (cachedAccess && cachedRefresh) {
      return { accessToken: cachedAccess, refreshToken: cachedRefresh };
    }

    const result = await refreshAccessToken(refreshToken);
    if (!result) return null;

    await redis
      .multi()
      .hmset(cacheKey, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
      .expire(cacheKey, TOKEN_TTL_SEC)
      .exec();

    return result;
  } catch (err) {
    const start = Date.now();
    while (Date.now() - start < MAX_POLL_MS) {
      const [polledAccess, polledRefresh] = await redis.hmget(
        cacheKey,
        'accessToken',
        'refreshToken',
      );
      if (polledAccess && polledRefresh) {
        return { accessToken: polledAccess, refreshToken: polledRefresh };
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    return null;
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (releaseError) {
        console.warn('Failed to release lock:', releaseError);
      }
    }
  }
}
