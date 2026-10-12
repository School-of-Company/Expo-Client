/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/sessionSeats.check.ts`
 */
import assert from 'node:assert/strict';
import {
  getCompanionLimit,
  getRemainingSeats,
  getSessionStatus,
} from './sessionSeats.ts';
import type { PreRegisterSession } from '../api/preRegister.ts';

const session = (partial: Partial<PreRegisterSession>): PreRegisterSession => ({
  title: '1회차',
  startedAt: '2026-10-31T09:30:00',
  endedAt: '2026-10-31T12:30:00',
  place: '추후 안내',
  capacity: 1000,
  waitingCapacity: 100,
  confirmedCount: 0,
  waitingCount: 0,
  ...partial,
});

// 정원이 남아 있으면 확정 자리를 쓴다
assert.equal(getRemainingSeats(session({ confirmedCount: 990 })), 10);
assert.equal(getCompanionLimit(session({ confirmedCount: 990 })), 9);

// 자리가 한 개면 대표자만 신청할 수 있다
assert.equal(getCompanionLimit(session({ confirmedCount: 999 })), 0);

// 정원이 차면 대기 자리로 넘어간다
assert.equal(
  getRemainingSeats(session({ confirmedCount: 1000, waitingCount: 97 })),
  3,
);

// 대기까지 차면 0이고 음수가 되지 않는다
const full = session({ confirmedCount: 1200, waitingCount: 200 });
assert.equal(getRemainingSeats(full), 0);
assert.equal(getCompanionLimit(full), 0);
assert.equal(getSessionStatus(full).canApply, false);

assert.equal(
  getSessionStatus(session({ confirmedCount: 1000 })).canApply,
  true,
);

console.log('sessionSeats checks passed');
