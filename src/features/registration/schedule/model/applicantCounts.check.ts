/**
 * 자체 점검: `node --experimental-strip-types src/features/registration/schedule/model/applicantCounts.check.ts`
 */
import assert from 'node:assert/strict';
import { getApplicantCounts } from './applicantCounts.ts';

const session = (
  programType: 'STANDARD' | 'TRAINING',
  programId: number,
  statusCounts: Record<string, number>,
) =>
  ({
    programType,
    programId,
    totalElements: 0,
    uniqueParticipants: 0,
    statusCounts,
    attendance: null,
  }) as never;

const summary = {
  totalSessions: 2,
  sessions: [
    session('TRAINING', 1, { CONFIRMED: 18, WAITING: 3, CANCELLED: 4 }),
    session('STANDARD', 1, { CONFIRMED: 7 }),
  ],
};

// 확정·대기만 센다(취소는 제외). 연수와 일반 프로그램의 같은 ID 를 구분한다
assert.deepEqual(
  getApplicantCounts({ id: 1, programType: 'TRAINING' }, summary),
  {
    confirmed: 18,
    waiting: 3,
  },
);
assert.deepEqual(
  getApplicantCounts({ id: 1, programType: 'STANDARD' }, summary),
  {
    confirmed: 7,
    waiting: 0,
  },
);
// 요약이 전체 회차를 담았고 이 회차에 신청이 없으면 0
assert.deepEqual(
  getApplicantCounts({ id: 9, programType: 'STANDARD' }, summary),
  {
    confirmed: 0,
    waiting: 0,
  },
);
// 요약을 못 읽었거나 일부 회차만 담았으면 단정하지 않는다
assert.equal(
  getApplicantCounts({ id: 1, programType: 'STANDARD' }, undefined),
  undefined,
);
assert.equal(
  getApplicantCounts(
    { id: 9, programType: 'STANDARD' },
    { ...summary, totalSessions: 150 },
  ),
  undefined,
);

console.log('applicantCounts.check: ok');
