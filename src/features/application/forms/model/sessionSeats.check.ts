/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/sessionSeats.check.ts`
 */
import assert from 'node:assert/strict';
import {
  getApplicantLimit,
  getCompanionLimit,
  isWaitingParty,
} from './sessionSeats.ts';

const cap = (remaining: number, maxApplicants: number, wait?: number) => ({
  sessionId: 1,
  remaining,
  maxApplicants,
  maxWaitingApplicants: wait,
});

// 확정 자리가 많으면 대표자 포함 5명이 상한이다
assert.equal(getApplicantLimit(cap(12, 5, 5)), 5);
assert.equal(getCompanionLimit(cap(12, 5, 5)), 4);
assert.equal(getApplicantLimit(cap(12, 10, 10)), 5);
assert.equal(getCompanionLimit(cap(12, 10, 10)), 4);

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

// 일행은 나뉘지 않는다: 확정에 다 들어가면 확정, 아니면 전체가 대기
assert.equal(isWaitingParty(cap(2, 5, 4), 2), false);
assert.equal(isWaitingParty(cap(2, 5, 4), 3), true);
assert.equal(isWaitingParty(cap(0, 5, 4), 1), true);
assert.equal(isWaitingParty(cap(2, 5, 4), 5), false); // 대기 한도도 넘으면 대기 아님(제출 불가)

console.log('sessionSeats checks passed');

// 대상별 정원 회차: remaining·maxApplicants 가 null 이어도 마감으로 보지 않는다
const target = (teacherAvailable: boolean, other: number, max = 5) => ({
  sessionId: 1,
  remaining: null,
  maxApplicants: null,
  targetSeats: {
    teacherAvailable,
    nonTeacherRemaining: other,
    nonTeacherMaxApplicants: max,
  },
});
assert.equal(getApplicantLimit(target(true, 0)), 5);
assert.equal(getApplicantLimit(target(false, 3)), 3);
assert.equal(getApplicantLimit(target(false, 0)), 0);
assert.equal(getCompanionLimit(target(true, 2)), 4);
// 대상별 정원 회차는 대기를 받지 않는다
assert.equal(
  isWaitingParty({ ...target(true, 0), maxWaitingApplicants: 5 }, 3),
  false,
);
