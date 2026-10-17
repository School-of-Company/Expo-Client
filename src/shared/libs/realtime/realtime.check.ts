/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/shared/libs/realtime/realtime.check.ts`
 */
import assert from 'node:assert/strict';
import { createCoalescedRunner, createRecentIds } from './coalesce';
import { parseAdminDataChanged, toUpstreamStreamPath } from './contract';
import { createSseParser, SseMessage } from './sseParser';

const collect = (chunks: string[]) => {
  const messages: SseMessage[] = [];
  const retries: number[] = [];
  const parser = createSseParser({
    onMessage: (message) => messages.push(message),
    onRetry: (ms) => retries.push(ms),
  });
  chunks.forEach((chunk) => parser.push(chunk));
  return { messages, retries, lastEventId: parser.lastEventId };
};

// 조각이 줄 중간·CRLF 사이에서 끊겨도 한 건으로 읽는다
{
  const { messages, lastEventId } = collect([
    '﻿id: 7\r',
    '\nevent: admin-data-changed\ndata: {"a"',
    ':1}\r\n\r\n',
  ]);
  assert.deepEqual(messages, [
    { event: 'admin-data-changed', data: '{"a":1}', id: '7' },
  ]);
  assert.equal(lastEventId, '7');
}

// 주석 heartbeat 와 data 없는 이벤트는 메시지가 아니다. 여러 data 줄은 \n 으로 잇는다
{
  const { messages, retries } = collect([
    ': ping\n\n',
    'event: heartbeat\n\n',
    'retry: 3000\ndata: a\ndata: b\n\n',
  ]);
  assert.deepEqual(messages, [{ event: 'message', data: 'a\nb' }]);
  assert.deepEqual(retries, [3000]);
}

// 계약 메시지 파싱: eventId 가 없으면 SSE id 를 쓰고, 모르는 리소스·다른 이벤트는 버린다
{
  const changed = parseAdminDataChanged({
    event: 'admin-data-changed',
    id: '42',
    data: JSON.stringify({
      expoId: 'ABCDEF01-0000-0000-0000-000000000000',
      resource: 'ATTENDANCE',
      occurredAt: '2026-10-17T10:00:00Z',
      sessionId: 3,
    }),
  });
  assert.deepEqual(changed, {
    eventId: '42',
    expoId: 'abcdef01-0000-0000-0000-000000000000',
    resource: 'ATTENDANCE',
    occurredAt: '2026-10-17T10:00:00Z',
    sessionId: '3',
    version: undefined,
  });
  assert.equal(
    parseAdminDataChanged({
      event: 'admin-data-changed',
      data: '{"eventId":"1","expoId":"1","resource":"PAYMENTS"}',
    }),
    null,
  );
  assert.equal(parseAdminDataChanged({ event: 'heartbeat', data: '{}' }), null);
  assert.equal(
    parseAdminDataChanged({ event: 'admin-data-changed', data: 'not json' }),
    null,
  );
}

// BFF 경로는 아는 리소스와 올바른 박람회 ID 만 Gateway 로 넘긴다
{
  assert.equal(
    toUpstreamStreamPath('applications', '12'),
    '/application/admin/expos/12/stream',
  );
  assert.equal(toUpstreamStreamPath('applications', '../internal'), null);
  assert.equal(toUpstreamStreamPath('internal', '12'), null);
}

// 같은 이벤트 ID 는 한 번만, 한도를 넘으면 오래된 ID 부터 잊는다
{
  const ids = createRecentIds(2);
  assert.equal(ids.add('a'), true);
  assert.equal(ids.add('a'), false);
  ids.add('b');
  ids.add('c');
  assert.equal(ids.add('a'), true);
}

// 병합: 대기 중 신호는 한 번으로, 조회 중 신호는 끝난 뒤 한 번 더
const runCoalesceCheck = async () => {
  let clock = 0;
  const timers: { at: number; run: () => void }[] = [];
  const advance = async (ms: number) => {
    clock += ms;
    for (;;) {
      const index = timers.findIndex(({ at }) => at <= clock);
      if (index === -1) break;
      const [timer] = timers.splice(index, 1);
      timer.run();
      await Promise.resolve();
    }
  };

  let calls = 0;
  let finish: () => void = () => undefined;
  const runner = createCoalescedRunner(
    () => {
      calls += 1;
      return new Promise<void>((resolve) => {
        finish = resolve;
      });
    },
    {
      delayMs: 100,
      minIntervalMs: 1000,
      now: () => clock,
      setTimer: (run, ms) => {
        const timer = { at: clock + ms, run };
        timers.push(timer);
        return timer;
      },
      clearTimer: (timer) => {
        const index = timers.indexOf(timer as (typeof timers)[number]);
        if (index !== -1) timers.splice(index, 1);
      },
    },
  );

  runner.trigger();
  runner.trigger();
  runner.trigger();
  await advance(100);
  assert.equal(calls, 1);

  // 조회 중 받은 신호
  runner.trigger();
  runner.trigger();
  finish();
  await new Promise((resolve) => setImmediate(resolve));
  // 최소 간격(1초)이 지나기 전에는 다시 조회하지 않는다
  await advance(500);
  assert.equal(calls, 1);
  await advance(500);
  assert.equal(calls, 2);

  finish();
  await new Promise((resolve) => setImmediate(resolve));
  await advance(5000);
  assert.equal(calls, 2);

  // 정리한 뒤에는 조회하지 않는다
  runner.trigger();
  runner.dispose();
  await advance(5000);
  assert.equal(calls, 2);
};

runCoalesceCheck().then(
  () => console.log('realtime check passed'),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
