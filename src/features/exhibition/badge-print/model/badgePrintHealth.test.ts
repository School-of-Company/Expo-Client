import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aliveStationCount,
  kstMillis,
  staleWaitingCount,
} from './badgePrintHealth';
import { outcomeOf } from './pendingReport';

const now = Date.parse('2026-10-31T10:00:00+09:00');

test('서버의 한국 시간 문자열은 소수 초가 있어도 같은 시각으로 읽는다', () => {
  assert.equal(kstMillis('2026-10-31T10:00:00.123456'), now);
  assert.ok(Number.isNaN(kstMillis(null)));
});

test('20초 안에 요청한 출력대만 켜진 것으로 세고 일시정지는 뺀다', () => {
  const station = (lastSeenAt: string | null, paused = false) => ({
    stationId: 's',
    label: '출력대',
    paused,
    lastSeenAt,
  });
  assert.equal(
    aliveStationCount(
      [
        station('2026-10-31T09:59:50'),
        station('2026-10-31T09:59:30'),
        station('2026-10-31T09:59:55', true),
        station(null),
      ],
      now,
    ),
    1,
  );
});

test('1분 넘게 기다린 WAITING 만 센다', () => {
  const job = (status: 'WAITING' | 'NEEDS_CHECK', updatedAt: string) => ({
    jobId: 1,
    name: '교사',
    school: null,
    status,
    updatedAt,
  });
  assert.equal(
    staleWaitingCount(
      [
        job('WAITING', '2026-10-31T09:58:30'),
        job('WAITING', '2026-10-31T09:59:30'),
        job('NEEDS_CHECK', '2026-10-31T09:50:00'),
      ],
      now,
    ),
    1,
  );
});

test('남은 보고는 인쇄를 불렀으면 SUBMITTED, 아니면 FAILED_BEFORE_PRINT 다', () => {
  const base = { jobId: 1, claimToken: 't', name: '교사', school: null };
  assert.equal(
    outcomeOf({ ...base, printCalled: false }),
    'FAILED_BEFORE_PRINT',
  );
  assert.equal(outcomeOf({ ...base, printCalled: true }), 'SUBMITTED');
  assert.equal(
    outcomeOf({ ...base, printCalled: false, outcome: 'SUBMITTED' }),
    'SUBMITTED',
  );
});
