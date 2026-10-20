/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/occupationOpen.check.ts`
 */
import assert from 'node:assert/strict';
import {
  formatOccupationOpenAt,
  getOccupationLock,
  isMixedParty,
} from './occupationOpen';

const OPEN = '2026-10-26T08:30:00+09:00';
const openAt = new Date(OPEN).getTime();

assert.equal(formatOccupationOpenAt(openAt), '10월 26일(월) 오전 8시 30분');
assert.equal(
  formatOccupationOpenAt(new Date('2026-10-22T13:00:00+09:00').getTime()),
  '10월 22일(목) 오후 1시',
);
assert.equal(
  formatOccupationOpenAt(new Date('2026-10-22T00:05:00+09:00').getTime()),
  '10월 22일(목) 오전 12시 5분',
);
// 서버가 UTC 로 내려줘도 KST 로 보인다
assert.equal(
  formatOccupationOpenAt(new Date('2026-10-25T23:30:00Z').getTime()),
  '10월 26일(월) 오전 8시 30분',
);

const before = getOccupationLock(OPEN, openAt - 1);
assert.deepEqual(before?.allowed, ['TEACHER', 'PRE_SERVICE_TEACHER']);
assert.equal(
  before?.notice,
  '교원·예비교사 외 유형은 10월 26일(월) 오전 8시 30분부터 신청 가능합니다.',
);
// 오픈 시각부터 풀린다
assert.equal(getOccupationLock(OPEN, openAt), null);
assert.equal(getOccupationLock(OPEN, openAt + 1), null);
// 값이 없으면 지금과 같다
assert.equal(getOccupationLock(null, 0), null);
assert.equal(getOccupationLock(undefined, 0), null);
assert.equal(getOccupationLock('잘못된 값', 0), null);

assert.equal(isMixedParty(['TEACHER', 'GENERAL']), true);
assert.equal(isMixedParty(['PARENT', 'PRE_SERVICE_TEACHER', undefined]), true);
assert.equal(isMixedParty(['TEACHER', 'PRE_SERVICE_TEACHER']), false);
assert.equal(isMixedParty(['GENERAL', 'PARENT']), false);
assert.equal(isMixedParty([undefined]), false);

console.log('occupationOpen.check: ok');
