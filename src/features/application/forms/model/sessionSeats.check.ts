/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/sessionSeats.check.ts`
 */
import assert from 'node:assert/strict';
import { getApplicantLimit, getCompanionLimit } from './sessionSeats.ts';

const cap = (remaining: number, maxApplicants: number) => ({
  sessionId: 1,
  remaining,
  maxApplicants,
});

// 남은 자리가 많으면 1회 최대 인원이 상한이다
assert.equal(getApplicantLimit(cap(12, 5)), 5);
assert.equal(getCompanionLimit(cap(12, 5)), 4);

// 남은 자리가 적으면 남은 자리가 상한이다
assert.equal(getApplicantLimit(cap(3, 5)), 3);
assert.equal(getCompanionLimit(cap(3, 5)), 2);

// 자리가 한 개면 대표자만, 0이면 신청 불가이고 음수가 되지 않는다
assert.equal(getCompanionLimit(cap(1, 5)), 0);
assert.equal(getApplicantLimit(cap(0, 5)), 0);
assert.equal(getCompanionLimit(cap(-2, 5)), 0);

console.log('sessionSeats checks passed');
