/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/sessionTimeMatch.check.ts`
 * 서버 #197 겹침 예시(회차 A 10–12, B 13–15)와 같은 결과여야 한다
 */
import assert from 'node:assert/strict';
import {
  getConfirmedSessionWindows,
  matchesSessionTime,
} from './sessionTimeMatch';
import type { OwnerApplication } from '../api/myApplications';

const day = '2026-10-31';
const at = (hm: string) => `${day}T${hm}`;
const window = (from: string, to: string) => ({
  startedAt: at(from),
  endedAt: at(to),
});
const both = [window('10:00', '12:00'), window('13:00', '15:00')];

assert.equal(matchesSessionTime(window('11:30', '12:30'), both), true);
assert.equal(matchesSessionTime(window('12:30', '13:30'), both), true);
assert.equal(matchesSessionTime(window('12:10', '12:50'), both), false);
// 끝과 시작이 맞닿기만 하면 겹치지 않는다
assert.equal(matchesSessionTime(window('12:00', '13:00'), both), false);
// 'YYYY-MM-DD HH:mm' 형식도 읽는다
assert.equal(
  matchesSessionTime(
    { startedAt: `${day} 11:30`, endedAt: `${day} 12:30` },
    both,
  ),
  true,
);
// 확정 회차를 모르면 막지 않는다
assert.equal(matchesSessionTime(window('12:10', '12:50'), []), true);

const app = (
  type: OwnerApplication['type'],
  status: OwnerApplication['status'],
  id: number,
) => ({ type, status, sessionOrProgramId: id }) as OwnerApplication;
const sessions = [
  { id: 1, ...window('10:00', '12:00') },
  { id: 2, ...window('13:00', '15:00') },
];
assert.deepEqual(
  getConfirmedSessionWindows(
    [
      app('PREREGISTER', 'CONFIRMED', 1),
      app('PREREGISTER', 'WAITING', 2),
      app('STANDARD', 'CONFIRMED', 2),
    ],
    sessions,
  ),
  [sessions[0]],
);
console.log('ok');
