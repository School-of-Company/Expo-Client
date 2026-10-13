import { createHash, randomUUID } from 'crypto';
import { redis } from '@/shared/libs/redis/redis';
import { REFRESH_TIMEOUT_MS, refreshAccessToken } from './refreshAccessToken';
import { RefreshTokenResult } from './type';

// 재발급 요청이 끝나기 전에 락이 풀리면 이미 무효가 된 refresh token 으로 다시 재발급하게 된다.
// 그래서 락 TTL > 재발급 timeout, 기다리는 쪽은 재발급 timeout 보다 조금 더 기다린다
const LOCK_TTL_MS = REFRESH_TIMEOUT_MS * 2;
const WAIT_MS = REFRESH_TIMEOUT_MS + 2_000;
const POLL_INTERVAL_MS = 100;
// 같은 refresh token 으로 조금 늦게 들어온 요청도 새 토큰을 받도록 결과를 잠깐 둔다
const RESULT_TTL_SEC = 10;

// 내 락일 때만 지운다. TTL 이 지나 다른 요청이 잡은 락을 지우지 않기 위해서다
const RELEASE_SCRIPT = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const readResult = async (key: string): Promise<RefreshTokenResult | null> => {
  const [accessToken, refreshToken] = await redis.hmget(
    key,
    'accessToken',
    'refreshToken',
  );
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
};

// 다른 요청이 재발급 중이면 결과를 기다린다. 락이 사라졌는데 결과가 없으면 재발급에 실패한 것이다
const waitForResult = async (
  resultKey: string,
  lockKey: string,
): Promise<RefreshTokenResult | null> => {
  const start = Date.now();
  try {
    while (Date.now() - start < WAIT_MS) {
      const result = await readResult(resultKey);
      if (result) return result;
      if (!(await redis.exists(lockKey))) return readResult(resultKey);
      await sleep(POLL_INTERVAL_MS);
    }
  } catch {
    // 기다리는 중 Redis 를 못 쓰게 되면 재발급 결과를 알 수 없다
  }
  return null;
};

/**
 * 같은 refresh token 으로 동시에 들어온 재발급을 한 번만 서버에 보낸다.
 * 서버는 재발급하면 이전 refresh token 을 무효로 하므로, 두 번 보내면 두 번째가 실패한다.
 */
export async function performTokenRefresh(
  refreshToken: string,
): Promise<RefreshTokenResult | null> {
  // Redis 키·로그에 토큰 원문을 남기지 않는다
  const id = createHash('sha256').update(refreshToken).digest('hex');
  const lockKey = `lock:refresh:${id}`;
  const resultKey = `rtk:${id}`;
  const owner = randomUUID();

  let acquired: boolean;
  try {
    const cached = await readResult(resultKey);
    if (cached) return cached;
    acquired =
      (await redis.set(lockKey, owner, 'PX', LOCK_TTL_MS, 'NX')) === 'OK';
  } catch {
    // Redis 장애로 로그아웃되지 않도록 동시 요청 보호 없이 바로 재발급한다
    return refreshAccessToken(refreshToken);
  }

  if (!acquired) return waitForResult(resultKey, lockKey);

  try {
    const result = await refreshAccessToken(refreshToken);
    if (result) {
      await redis
        .multi()
        .hset(resultKey, result)
        .expire(resultKey, RESULT_TTL_SEC)
        .exec()
        .catch(() => undefined);
    }
    return result;
  } finally {
    await redis.eval(RELEASE_SCRIPT, 1, lockKey, owner).catch(() => undefined);
  }
}
