/**
 * 자체 점검: `TZ=America/Los_Angeles JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/programApply.check.ts`
 */
import assert from 'node:assert/strict';
import {
  getOnsiteSeatsLabel,
  getProgramInfoRows,
  isProgramApplicationEnded,
} from './programApply';
import type { ProgramPolicy } from '@/shared/types/program/list/type';

const at = (value: string) => Date.parse(value);

// 골든벨: 사전 10/21~10/30(KST), 현장 10/31 00:00~13:30(KST). 사전 50 + 현장 50
const policy: ProgramPolicy = {
  groupId: null,
  formId: 'f',
  allowedOccupations: ['GENERAL'],
  capacity: 100,
  waitingCapacity: 10,
  applicationStartedAt: '2026-10-20T15:00:00Z',
  applicationEndedAt: '2026-10-29T15:00:00Z',
  cancelEndedAt: '2026-10-29T15:00:00Z',
  promotionEndedAt: '2026-10-29T15:00:00Z',
  closed: false,
  preRegistrationCapacity: 50,
  onsiteCapacity: 50,
  onsiteStartedAt: '2026-10-30T15:00:00Z',
  onsiteEndedAt: '2026-10-31T04:30:00Z',
};
const program = {
  startedAt: '2026-10-31 13:30',
  endedAt: '2026-10-31 14:30',
  place: null,
  policy,
};
const capacityOf = (now: string) =>
  getProgramInfoRows(program, at(now)).find(({ label }) => label === '정원')
    ?.value;

// 현장 접수 기간 전에는 현장을 드러내지 않고 사전 정원만 보인다
assert.equal(capacityOf('2026-10-25T00:00:00Z'), '50명 (대기 10명)');
// 기간 중에는 사전·현장을 나눠 보인다
assert.equal(
  capacityOf('2026-10-30T16:00:00Z'),
  '100명 (대기 10명) · 사전 50명, 현장 50명',
);
// 기간이 끝나면 다시 숨긴다
assert.equal(capacityOf('2026-10-31T05:00:00Z'), '50명 (대기 10명)');
// 현장 정원이 없는 회차는 총정원 그대로다
assert.equal(
  getProgramInfoRows(
    {
      ...program,
      policy: { ...policy, onsiteCapacity: 0, preRegistrationCapacity: 100 },
    },
    at('2026-10-25T00:00:00Z'),
  ).find(({ label }) => label === '정원')?.value,
  '100명 (대기 10명)',
);

// 사전 접수가 끝나도 현장 접수 기간이 끝나기 전까지는 목록에 남긴다
assert.equal(
  isProgramApplicationEnded(policy, at('2026-10-25T00:00:00Z')),
  false,
);
assert.equal(
  isProgramApplicationEnded(policy, at('2026-10-30T10:00:00Z')),
  false,
);
assert.equal(
  isProgramApplicationEnded(policy, at('2026-10-30T16:00:00Z')),
  false,
);
assert.equal(
  isProgramApplicationEnded(policy, at('2026-10-31T04:30:00Z')),
  true,
);
// 현장 정원이나 기간이 없으면 사전 접수 마감에 숨긴다
assert.equal(
  isProgramApplicationEnded(
    { ...policy, onsiteCapacity: 0 },
    at('2026-10-30T10:00:00Z'),
  ),
  true,
);
assert.equal(
  isProgramApplicationEnded(
    { ...policy, onsiteStartedAt: null, onsiteEndedAt: null },
    at('2026-10-30T10:00:00Z'),
  ),
  true,
);

// 현장 잔여석에는 대기 문구가 없다
assert.equal(
  getOnsiteSeatsLabel({ capacity: 50, confirmedCount: 12, remaining: 38 }),
  '현장 잔여 38명',
);

console.log('programApply.check: ok');
