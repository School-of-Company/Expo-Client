import { randomUUID } from 'node:crypto';

const EGRESS_IP_URL = 'https://api.ipify.org?format=json';
const EGRESS_IP_TIMEOUT_MS = 1_500;
// 조회가 실패했을 때 매 요청마다 다시 부르지 않도록 둔 간격
const EGRESS_IP_RETRY_MS = 60_000;
const WEBHOOK_TIMEOUT_MS = 2_000;
export const ALERT_THRESHOLD = 3;
export const ALERT_COOLDOWN_MS = 10 * 60_000;

export type UpstreamFailureInfo = {
  method?: string;
  url?: string;
  code?: string;
};

type Options = {
  webhookUrl?: string;
  deploymentId?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  log?: (label: string, payload: Record<string, unknown>) => void;
  threshold?: number;
  cooldownMs?: number;
};

const withTimeout = (ms: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
};

const toKst = (ms: number) =>
  new Date(ms).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

/**
 * 504 가 난 인스턴스를 서버·학교망 방화벽 기록과 맞춰 보기 위한 값들.
 * 실패한 요청은 서버에 도착하지 않아 출발지 IP 를 서버 쪽에서 알 수 없으므로, 보내는 쪽에서 출구 IP 를 남긴다.
 * 문제 인스턴스는 몇 분만 살아 있어 사람이 로그를 보고 연락하면 늦으므로, 연속 실패면 웹훅으로 바로 알린다
 */
export const createUpstreamAlert = ({
  webhookUrl,
  deploymentId,
  fetchImpl = fetch,
  now = Date.now,
  log = (label, payload) => console.error(label, JSON.stringify(payload)),
  threshold = ALERT_THRESHOLD,
  cooldownMs = ALERT_COOLDOWN_MS,
}: Options = {}) => {
  // Vercel 런타임 로그에는 인스턴스 구분 값이 없어 직접 만든다
  const instanceId = randomUUID().slice(0, 8);
  const startedAt = now();
  let egressIp: string | undefined;
  let lookup: Promise<string | undefined> | undefined;
  let lookupFailedAt: number | undefined;
  let consecutiveFailures = 0;
  let lastAlertAt: number | undefined;

  const lookupEgressIp = () => {
    if (egressIp) return Promise.resolve(egressIp);
    if (lookup) return lookup;
    if (
      lookupFailedAt !== undefined &&
      now() - lookupFailedAt < EGRESS_IP_RETRY_MS
    )
      return Promise.resolve(undefined);
    const timeout = withTimeout(EGRESS_IP_TIMEOUT_MS);
    lookup = fetchImpl(EGRESS_IP_URL, { signal: timeout.signal })
      .then((res) => res.json() as Promise<{ ip?: string }>)
      .then(({ ip }) => {
        egressIp = ip;
        log('[gateway-egress]', {
          instance: instanceId,
          startedAt: new Date(startedAt).toISOString(),
          egressIp: ip,
        });
        return ip;
      })
      .catch((error: Error) => {
        lookupFailedAt = now();
        log('[gateway-egress]', {
          instance: instanceId,
          egressIp: null,
          error: error.message,
        });
        return undefined;
      })
      .finally(() => {
        timeout.done();
        lookup = undefined;
      });
    return lookup;
  };

  const sendAlert = async (failure: UpstreamFailureInfo) => {
    if (!webhookUrl) return;
    const text = [
      `[Expo-Client] Gateway 연결 실패 ${consecutiveFailures}회 연속`,
      `시각(KST): ${toKst(now())}`,
      `출구 IP: ${egressIp ?? '조회 실패'}`,
      `인스턴스: ${instanceId} (시작 ${toKst(startedAt)})`,
      `마지막 실패: ${failure.method ?? ''} ${failure.url ?? ''} (${failure.code ?? 'unknown'})`,
      deploymentId ? `배포: ${deploymentId}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');
    const timeout = withTimeout(WEBHOOK_TIMEOUT_MS);
    try {
      // Slack 은 text, Discord 는 content 를 읽는다
      await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, content: text }),
        signal: timeout.signal,
      });
    } catch (error) {
      log('[gateway-alert-failure]', {
        instance: instanceId,
        message: (error as Error).message,
      });
    } finally {
      timeout.done();
    }
  };

  return {
    instanceId,
    getEgressIp: () => egressIp,
    // 첫 Gateway 요청 때 미리 조회해 둔다. 실패 로그를 남길 때는 이미 값이 있도록 기다리지 않는다
    prefetchEgressIp: () => {
      void lookupEgressIp();
    },
    recordSuccess: () => {
      consecutiveFailures = 0;
    },
    /** 응답 없이 끊긴 실패만 넘긴다. 서버가 응답한 5xx 는 연결 문제가 아니다 */
    recordFailure: async (failure: UpstreamFailureInfo) => {
      consecutiveFailures += 1;
      if (consecutiveFailures < threshold) return;
      if (lastAlertAt !== undefined && now() - lastAlertAt < cooldownMs) return;
      lastAlertAt = now();
      await lookupEgressIp();
      await sendAlert(failure);
    },
  };
};

export const upstreamAlert = createUpstreamAlert({
  webhookUrl: process.env.GATEWAY_ALERT_WEBHOOK_URL,
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
});
