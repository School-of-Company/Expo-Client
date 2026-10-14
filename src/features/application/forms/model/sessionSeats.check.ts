/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/sessionSeats.check.ts`
 */
import assert from 'node:assert/strict';
import { getApplicantLimit, getCompanionLimit } from './sessionSeats.ts';

const cap = (remaining: number, maxApplicants: number, wait?: number) => ({
  sessionId: 1,
  remaining,
  maxApplicants,
  maxWaitingApplicants: wait,
});

// 확정 자리가 많으면 대표자 포함 5명이 상한이다
assert.equal(getApplicantLimit(cap(12, 5, 5)), 5);
assert.equal(getCompanionLimit(cap(12, 5, 5)), 4);

// 확정이 모자라도 대기 한도가 있으면 그만큼 추가할 수 있다
assert.equal(getApplicantLimit(cap(2, 5, 4)), 4);
assert.equal(getCompanionLimit(cap(2, 5, 4)), 3);

// 확정석이 차서 remaining·maxApplicants가 0이어도 대기로 신청할 수 있다
assert.equal(getApplicantLimit(cap(0, 0, 3)), 3);

// 대기 한도를 안 내려주거나 0이면 확정만 본다
assert.equal(getApplicantLimit(cap(3, 5)), 3);
assert.equal(getApplicantLimit(cap(0, 0)), 0);
assert.equal(getApplicantLimit(cap(0, 0, 0)), 0);
assert.equal(getCompanionLimit(cap(-2, 5, 0)), 0);

console.log('sessionSeats checks passed');
