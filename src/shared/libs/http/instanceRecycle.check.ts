/**
 * 자체 점검: `node --experimental-strip-types src/shared/libs/http/instanceRecycle.check.ts`
 */
import assert from 'node:assert/strict';
import { createInstanceRecycle } from './instanceRecycle.ts';

const setup = (enabled = true) => {
  const exits: number[] = [];
  const logs: [string, Record<string, unknown>][] = [];
  const recycle = createInstanceRecycle({
    enabled,
    exit: (code) => exits.push(code),
    log: (label, payload) => logs.push([label, payload]),
    exitDelayMs: 0,
    now: () => Date.UTC(2026, 9, 22, 9, 49, 15),
  });
  return { recycle, exits, logs };
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 5));

async function main() {
  // 한 번도 연결하지 못한 인스턴스는 연결 실패 2번째에 불량으로 판정한다
  {
    const { recycle, exits, logs } = setup();
    assert.equal(recycle.recordConnectFailure(), false);
    assert.equal(recycle.recordConnectFailure(), true);
    // 판정만으로는 내리지 않는다. 알림을 보낸 뒤 recycle 을 불러야 내린다
    await wait();
    assert.deepEqual(exits, []);
    recycle.recycle({ instance: 'a', egressIp: '3.35.1.2' });
    await wait();
    assert.deepEqual(exits, [1]);
    assert.equal(logs[0][0], '[gateway-instance-recycle]');
    assert.deepEqual(logs[0][1], {
      at: '2026-10-22T09:49:15.000Z',
      instance: 'a',
      egressIp: '3.35.1.2',
      failures: 2,
      exiting: true,
    });
    // 이미 판정했으면 다시 판정하지 않는다
    assert.equal(recycle.recordConnectFailure(), false);
  }

  // 한 번이라도 연결된 인스턴스는 판정하지 않는다 (순간적인 흔들림이거나 Gateway 자체 장애일 수 있다)
  {
    const { recycle } = setup();
    recycle.recordConnected();
    for (let i = 0; i < 5; i += 1)
      assert.equal(recycle.recordConnectFailure(), false);
  }

  // 로컬 개발(Vercel 아님)에서는 로그만 남기고 내리지 않는다
  {
    const { recycle, exits, logs } = setup(false);
    recycle.recordConnectFailure();
    assert.equal(recycle.recordConnectFailure(), true);
    recycle.recycle({});
    await wait();
    assert.deepEqual(exits, []);
    assert.equal(logs[0][1].exiting, false);
  }

  console.log('instanceRecycle check: ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
