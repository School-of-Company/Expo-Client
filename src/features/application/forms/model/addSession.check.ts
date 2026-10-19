/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/addSession.check.ts`
 */
import assert from 'node:assert/strict';
import { getSessionBlockReason, hasOnlyStudents } from './addSession';
import type { OwnerApplication } from '../api/myApplications';
import type { PublicPreregisterSession } from '../api/preRegister';

const session = (
  id: number,
  from: string,
  to: string,
  closed = false,
): PublicPreregisterSession => ({
  id,
  title: `회차 ${id}`,
  startedAt: `2099-10-31T${from}`,
  endedAt: `2099-10-31T${to}`,
  place: null,
  closed,
  cancelEndedAt: null,
});
const morning = session(1, '10:00', '12:00');
const afternoon = session(2, '13:00', '15:00');
const overlapping = session(3, '11:30', '13:30');
const closed = session(4, '16:00', '17:00', true);
const past = {
  ...session(5, '09:00', '09:30'),
  startedAt: '2000-01-01T09:00',
  endedAt: '2000-01-01T09:30',
};
const sessions = [morning, afternoon, overlapping, closed, past];

const app = (
  status: OwnerApplication['status'],
  sessionOrProgramId: number,
  type: OwnerApplication['type'] = 'PREREGISTER',
) => ({ type, status, sessionOrProgramId });

// 오전 회차를 확정한 일행
const mine = [app('CONFIRMED', 1)];
const reason = (s: PublicPreregisterSession, apps = mine) =>
  getSessionBlockReason(s, sessions, apps);

assert.equal(reason(morning), 'APPLIED');
assert.equal(reason(afternoon), null);
// 확정 회차와 시간이 일부라도 겹치면 막는다
assert.equal(reason(overlapping), 'OVERLAP');
assert.equal(reason(closed), 'CLOSED');
assert.equal(reason(past), 'ENDED');
// 대기 중인 회차도 이미 신청한 것으로 본다
assert.equal(reason(afternoon, [app('WAITING', 2)]), 'APPLIED');
// 취소한 회차는 다시 고를 수 있다
assert.equal(reason(morning, [app('CANCELLED', 1)]), null);
// 프로그램 신청은 사전등록 회차를 막지 않는다
assert.equal(reason(morning, [app('CONFIRMED', 1, 'STANDARD')]), null);

const person = (participantId: number, occupation: string | null) => ({
  participantId,
  occupation: occupation as never,
});
const group = [
  person(1, 'GENERAL'),
  person(2, 'ELEMENTARY_STUDENT'),
  person(3, 'HIGH_SCHOOL_STUDENT'),
  person(4, null),
];
// 대표 불참: 학생만 남으면 막고, 학생이 아닌 사람이 1명이라도 있으면 허용한다
assert.equal(hasOnlyStudents(group, [2, 3]), true);
assert.equal(hasOnlyStudents(group, [1, 2]), false);
// 직업을 모르는 참석자는 학생으로 보지 않는다
assert.equal(hasOnlyStudents(group, [2, 4]), false);
assert.equal(hasOnlyStudents(group, []), false);

console.log('ok');
