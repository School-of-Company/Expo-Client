/**
 * 자체 점검: `node --experimental-strip-types src/shared/libs/http/upstreamAlert.check.ts`
 */
import assert from 'node:assert/strict';
import { createUpstreamAlert } from './upstreamAlert.ts';

type Call = { url: string; body?: string };

const setup = (
  options: {
    webhookUrl?: string;
    ipFails?: boolean;
    webhookFails?: boolean;
  } = {},
) => {
  let clock = 1_000_000;
  const calls: Call[] = [];
  const logs: [string, Record<string, unknown>][] = [];
  const fetchImpl = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, body: init?.body as string | undefined });
    if (url.includes('ipify')) {
      if (options.ipFails) throw new Error('ipify down');
      return new Response('{"ip":"3.35.1.2"}');
    }
    if (options.webhookFails) throw new Error('webhook down');
    return new Response('ok');
  }) as typeof fetch;
  const alert = createUpstreamAlert({
    webhookUrl:
      'webhookUrl' in options ? options.webhookUrl : 'https://hooks.example/x',
    deploymentId: 'dpl_test',
    fetchImpl,
    now: () => clock,
    log: (label, payload) => logs.push([label, payload]),
  });
  return {
    alert,
    calls,
    logs,
    tick: (ms: number) => {
      clock += ms;
    },
  };
};

const failure = {
  method: 'GET',
  url: 'https://a.glink.kr/expo/expo',
  code: 'ECONNABORTED',
};
const webhookCalls = (calls: Call[]) =>
  calls.filter((c) => c.url.includes('hooks'));

async function main() {
  // 출구 IP 는 한 번만 조회하고, 조회되면 인스턴스와 함께 한 줄 남긴다
  {
    const { alert, calls, logs } = setup();
    alert.prefetchEgressIp();
    alert.prefetchEgressIp();
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(alert.getEgressIp(), '3.35.1.2');
    assert.equal(calls.filter((c) => c.url.includes('ipify')).length, 1);
    assert.equal(logs[0][0], '[gateway-egress]');
    assert.equal(logs[0][1].egressIp, '3.35.1.2');
    assert.equal(logs[0][1].instance, alert.instanceId);
  }

  // 연속 3번째 실패에서 한 번 알리고, 출구 IP·경로·배포가 메시지에 들어간다
  {
    const { alert, calls } = setup();
    await alert.recordFailure(failure);
    await alert.recordFailure(failure);
    assert.equal(webhookCalls(calls).length, 0);
    await alert.recordFailure(failure);
    const sent = webhookCalls(calls);
    assert.equal(sent.length, 1);
    const body = JSON.parse(sent[0].body ?? '{}');
    assert.equal(body.text, body.content);
    assert.match(body.text, /3회 연속/);
    assert.match(body.text, /출구 IP: 3\.35\.1\.2/);
    assert.match(
      body.text,
      /GET https:\/\/a\.glink\.kr\/expo\/expo \(ECONNABORTED\)/,
    );
    assert.match(body.text, /배포: dpl_test/);
  }

  // 같은 인스턴스는 10분 동안 다시 알리지 않고, 지나면 다시 알린다
  {
    const { alert, calls, tick } = setup();
    for (let i = 0; i < 5; i += 1) await alert.recordFailure(failure);
    assert.equal(webhookCalls(calls).length, 1);
    tick(10 * 60_000);
    await alert.recordFailure(failure);
    assert.equal(webhookCalls(calls).length, 2);
  }

  // 중간에 성공하면 연속 횟수를 처음부터 다시 센다
  {
    const { alert, calls } = setup();
    await alert.recordFailure(failure);
    await alert.recordFailure(failure);
    alert.recordSuccess();
    await alert.recordFailure(failure);
    await alert.recordFailure(failure);
    assert.equal(webhookCalls(calls).length, 0);
  }

  // 웹훅 주소가 없으면 보내지 않는다
  {
    const { alert, calls } = setup({ webhookUrl: undefined });
    for (let i = 0; i < 3; i += 1) await alert.recordFailure(failure);
    assert.equal(webhookCalls(calls).length, 0);
  }

  // 출구 IP 조회나 웹훅이 실패해도 예외를 던지지 않고 로그만 남긴다
  {
    const { alert, calls, logs } = setup({ ipFails: true, webhookFails: true });
    for (let i = 0; i < 3; i += 1) await alert.recordFailure(failure);
    assert.equal(alert.getEgressIp(), undefined);
    assert.match(webhookCalls(calls)[0].body ?? '', /출구 IP: 조회 실패/);
    assert.ok(logs.some(([label]) => label === '[gateway-alert-failure]'));
  }

  console.log('upstreamAlert check: ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
