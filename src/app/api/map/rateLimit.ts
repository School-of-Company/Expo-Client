import { getClientIp } from '@/shared/libs/http/clientIp';

// 카카오 REST 키를 쓰는 지도 프록시가 남용되지 않도록 IP별 요청 수를 제한한다.
// 서버 인스턴스 메모리에만 두는 가벼운 제한이라 인스턴스가 여러 개면 각자 센다
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const MAX_TRACKED_IPS = 10_000;

const hits = new Map<string, number[]>();

/** 제한을 넘었으면 true를 돌려준다 */
export const isRateLimited = (request: Request) => {
  const ip = getClientIp(request);
  // IP 를 모르면 모든 사용자가 한 버킷에 묶여 서비스 전체가 분당 30회로 막히므로 제한하지 않는다
  if (!ip) return false;

  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // 오래 쌓이지 않도록 추적 IP가 많아지면 창이 지난 기록을 비운다
  if (hits.size > MAX_TRACKED_IPS) {
    hits.forEach((times, key) => {
      if (now - times[times.length - 1] >= WINDOW_MS) hits.delete(key);
    });
  }

  return false;
};
