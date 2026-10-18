/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/applicationSchedule.check.ts`
 */
import assert from 'node:assert/strict';
import {
  canShowProgramCapacity,
  getPreRegisterScheduleStatus,
  getProgramScheduleStatus,
} from './applicationSchedule.ts';

const now = new Date('2026-10-20T00:00:00Z').getTime();
const future = '2026-11-01T10:00:00Z';
const past = '2026-10-01T10:00:00Z';

// 사전등록: 신청서 접수 전이면 회차가 열려 있어도 접수 전이다(좌석 마감이 아니다)
const session = { closed: false, endedAt: future };
assert.equal(
  getPreRegisterScheduleStatus('UPCOMING', session, now),
  'UPCOMING',
);
assert.equal(getPreRegisterScheduleStatus('OPEN', session, now), 'OPEN');
assert.equal(getPreRegisterScheduleStatus('CLOSED', session, now), 'CLOSED');
assert.equal(getPreRegisterScheduleStatus(null, session, now), 'UNSET');
// 운영 마감·종료는 신청서 기간보다 먼저 본다
assert.equal(
  getPreRegisterScheduleStatus('OPEN', { closed: true, endedAt: future }, now),
  'CLOSED',
);
assert.equal(
  getPreRegisterScheduleStatus(
    'UPCOMING',
    { closed: false, endedAt: past },
    now,
  ),
  'ENDED',
);

const policy = {
  groupId: null,
  formId: 'f',
  allowedOccupations: ['GENERAL' as const],
  capacity: 30,
  waitingCapacity: 0,
  applicationStartedAt: '2026-10-25T00:00:00Z',
  applicationEndedAt: '2026-10-30T00:00:00Z',
  cancelEndedAt: '2026-10-30T00:00:00Z',
  promotionEndedAt: '2026-10-30T00:00:00Z',
  closed: false,
  preRegistrationCapacity: 30,
  onsiteCapacity: 0,
};

// 프로그램: 접수 시작 전·중·후
assert.equal(
  getProgramScheduleStatus({ policy, endedAt: future }, now),
  'UPCOMING',
);
assert.equal(
  getProgramScheduleStatus(
    { policy, endedAt: future },
    time('2026-10-26T00:00:00Z'),
  ),
  'OPEN',
);
// 마감 시각 정각부터 마감이다
assert.equal(
  getProgramScheduleStatus(
    { policy, endedAt: future },
    time('2026-10-30T00:00:00Z'),
  ),
  'CLOSED',
);
assert.equal(
  getProgramScheduleStatus(
    { policy: { ...policy, closed: true }, endedAt: future },
    now,
  ),
  'CLOSED',
);
assert.equal(
  getProgramScheduleStatus({ policy: null, endedAt: future }, now),
  'UNSET',
);
assert.equal(getProgramScheduleStatus({ policy, endedAt: past }, now), 'ENDED');

function time(value: string) {
  return new Date(value).getTime();
}

// 정원 숫자: 일반 대상 일반 프로그램만 보인다
assert.equal(canShowProgramCapacity({ programType: 'STANDARD', policy }), true);
assert.equal(
  canShowProgramCapacity({
    programType: 'STANDARD',
    policy: {
      ...policy,
      allowedOccupations: ['GENERAL', 'PRE_SERVICE_TEACHER'],
    },
  }),
  false,
);
assert.equal(
  canShowProgramCapacity({ programType: 'TRAINING', policy }),
  false,
);
assert.equal(
  canShowProgramCapacity({ programType: 'STANDARD', policy: null }),
  false,
);

console.log('applicationSchedule ok');
