/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/applicationSchedule.check.ts`
 */
import assert from 'node:assert/strict';
import {
  formatCapacity,
  getOnsitePhase,
  getProgramCapacity,
  getScheduleBoundaries,
  time as parseTime,
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

// 정원: 설정 정원은 대상·프로그램 종류와 상관없이 신청 전에도 보인다(#748)
assert.equal(getProgramCapacity({ policy }, now), policy.capacity);
assert.equal(
  getProgramCapacity(
    {
      policy: {
        ...policy,
        allowedOccupations: ['TEACHER', 'PRE_SERVICE_TEACHER'],
      },
    },
    now,
  ),
  policy.capacity,
);
assert.equal(getProgramCapacity({ policy: null }, now), undefined);
assert.equal(
  getProgramCapacity({ policy: { ...policy, capacity: 0 } }, now),
  undefined,
);

assert.equal(formatCapacity([300]), '정원 300명');
assert.equal(formatCapacity([16, 16, 16]), '회차당 정원 16명');
assert.equal(formatCapacity([20, 30, 1000]), '회차당 정원 20~1,000명');
assert.equal(formatCapacity([undefined, 30]), '회차당 정원 30명');
assert.equal(formatCapacity([undefined]), null);

console.log('applicationSchedule ok');

// 현장 접수(#773): 골든벨 초등 — 사전 10/21~10/30, 현장 10/31 00:00~13:30(KST). 정원 사전 50 + 현장 50
const onsitePolicy = {
  ...policy,
  capacity: 100,
  preRegistrationCapacity: 50,
  onsiteCapacity: 50,
  applicationStartedAt: '2026-10-20T15:00:00Z',
  applicationEndedAt: '2026-10-29T15:00:00Z',
  onsiteStartedAt: '2026-10-30T15:00:00Z',
  onsiteEndedAt: '2026-10-31T04:30:00Z',
};
// 프로그램 시각은 오프셋 없는 KST 다
const golden = { policy: onsitePolicy, endedAt: '2026-10-31 14:30' };
const at = (value: string) => time(value);

assert.equal(
  getOnsitePhase(onsitePolicy, at('2026-10-30T14:59:59Z')),
  'BEFORE',
);
assert.equal(getOnsitePhase(onsitePolicy, at('2026-10-30T15:00:00Z')), 'OPEN');
// 종료 시각 정각부터 현장 접수는 닫힌다
assert.equal(getOnsitePhase(onsitePolicy, at('2026-10-31T04:30:00Z')), 'AFTER');
assert.equal(
  getOnsitePhase({ ...onsitePolicy, onsiteCapacity: 0 }, now),
  'NONE',
);
assert.equal(
  getOnsitePhase(
    { ...onsitePolicy, onsiteStartedAt: null, onsiteEndedAt: null },
    now,
  ),
  'NONE',
);
assert.equal(getOnsitePhase(null, now), 'NONE');

// 10/30까지 사전 마감 뒤에는 접수 마감이고 현장 접수 중이 아니다
assert.equal(
  getProgramScheduleStatus(golden, at('2026-10-30T10:00:00Z')),
  'CLOSED',
);
// 10/31 00:00(KST)부터 현장 접수 중
assert.equal(
  getProgramScheduleStatus(golden, at('2026-10-30T15:00:01Z')),
  'ONSITE_OPEN',
);
// 사전 접수 중이면 접수 중이 우선이다
assert.equal(
  getProgramScheduleStatus(
    {
      ...golden,
      policy: { ...onsitePolicy, applicationEndedAt: '2026-10-31T01:00:00Z' },
    },
    at('2026-10-30T15:00:01Z'),
  ),
  'OPEN',
);
// 현장 접수가 끝나면 마감, 운영 마감은 현장 접수도 막는다
assert.equal(
  getProgramScheduleStatus(golden, at('2026-10-31T04:30:00Z')),
  'CLOSED',
);
assert.equal(
  getProgramScheduleStatus(
    { ...golden, policy: { ...onsitePolicy, closed: true } },
    at('2026-10-30T15:00:01Z'),
  ),
  'CLOSED',
);
// 프로그램 endedAt(KST)이 지나야 종료다. 기기 시간대로 읽으면 이 단언이 시간대마다 달라진다
assert.equal(
  getProgramScheduleStatus(golden, at('2026-10-31T05:29:59Z')),
  'CLOSED',
);
assert.equal(
  getProgramScheduleStatus(golden, at('2026-10-31T05:30:01Z')),
  'ENDED',
);

// 시각 파싱: 오프셋 없으면 KST, 있으면 그대로
assert.equal(parseTime('2026-10-31 10:30'), Date.parse('2026-10-31T01:30:00Z'));
assert.equal(parseTime('2026-10-31T10:30'), Date.parse('2026-10-31T01:30:00Z'));
assert.equal(
  parseTime('2026-10-31T10:30:00+09:00'),
  Date.parse('2026-10-31T01:30:00Z'),
);
assert.equal(
  parseTime('2026-10-31T01:30:00Z'),
  Date.parse('2026-10-31T01:30:00Z'),
);
assert.ok(Number.isNaN(parseTime(null)));

// 정원: 현장 접수 기간 밖에는 사전 정원만, 기간 중에는 총정원
assert.equal(getProgramCapacity(golden, at('2026-10-30T10:00:00Z')), 50);
assert.equal(getProgramCapacity(golden, at('2026-10-30T15:00:01Z')), 100);
assert.equal(getProgramCapacity(golden, at('2026-10-31T05:00:00Z')), 50);

// 켜 둔 화면이 현장 접수 시작·마감에 바뀌도록 경계에 넣는다
const boundaries = getScheduleBoundaries([golden], [], null);
assert.ok(boundaries.includes(at('2026-10-30T15:00:00Z')));
assert.ok(boundaries.includes(at('2026-10-31T04:30:00Z')));
assert.ok(boundaries.includes(at('2026-10-31T05:30:00Z')));
