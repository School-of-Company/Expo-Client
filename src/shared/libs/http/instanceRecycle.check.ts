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
  });
  return { recycle, exits, logs };
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 5));

async function main() {
  // 한 번도 연결하지 못한 인스턴스는 연결 실패 3번째에 내린다
  {
    const { recycle, exits, logs } = setup();
    assert.equal(recycle.recordConnectFailure({ instance: 'a' }), false);
    assert.equal(recycle.recordConnectFailure({ instance: 'a' }), false);
    assert.equal(recycle.recordConnectFailure({ instance: 'a' }), true);
    await wait();
    assert.deepEqual(exits, [1]);
    assert.equal(logs[0][0], '[gateway-instance-recycle]');
    assert.equal(logs[0][1].failures, 3);
    assert.equal(logs[0][1].instance, 'a');
    // 이미 내리기로 했으면 다시 종료를 걸지 않는다
    assert.equal(recycle.recordConnectFailure({}), false);
    await wait();
    assert.deepEqual(exits, [1]);
  }

  // 한 번이라도 연결된 인스턴스는 내리지 않는다 (Gateway 자체 장애일 수 있다)
  {
    const { recycle, exits } = setup();
    recycle.recordConnected();
    for (let i = 0; i < 5; i += 1) recycle.recordConnectFailure({});
    await wait();
    assert.deepEqual(exits, []);
  }

  // 로컬 개발(Vercel 아님)에서는 로그만 남기고 내리지 않는다
  {
    const { recycle, exits, logs } = setup(false);
    for (let i = 0; i < 3; i += 1) recycle.recordConnectFailure({});
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
