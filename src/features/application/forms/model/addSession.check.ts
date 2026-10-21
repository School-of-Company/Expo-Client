/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/addSession.check.ts`
 */
import assert from 'node:assert/strict';
import {
  getParticipantBlockReason,
  getSessionBlockReason,
  isCurrentParticipant,
} from './addSession';
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
  participantId = 1,
) => ({ type, status, sessionOrProgramId, participantId });

// 오전 회차를 확정한 혼자 온 신청자
const mine = [app('CONFIRMED', 1)];
const reason = (s: PublicPreregisterSession, apps = mine, ids = [1]) =>
  getSessionBlockReason(s, sessions, apps, ids);

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

// 대표자(1)는 오전·오후, 동행자(2)는 오후만 확정한 일행
const party = [
  app('CONFIRMED', 1, 'PREREGISTER', 1),
  app('CONFIRMED', 2, 'PREREGISTER', 1),
  app('CONFIRMED', 2, 'PREREGISTER', 2),
];
const partyReason = (s: PublicPreregisterSession, ids = [1, 2]) =>
  reason(s, party, ids);
const participantReason = (s: PublicPreregisterSession, id: number) =>
  getParticipantBlockReason(s, sessions, party, id);
// 대표자가 신청한 회차라도 동행자를 더할 수 있으면 회차를 막지 않는다
assert.equal(partyReason(morning), null);
assert.equal(participantReason(morning, 1), 'APPLIED');
assert.equal(participantReason(morning, 2), null);
// 시간 겹침도 참석자마다 본다
assert.equal(participantReason(overlapping, 1), 'OVERLAP');
assert.equal(participantReason(overlapping, 2), 'OVERLAP');
assert.equal(partyReason(overlapping), 'OVERLAP');
// 모두 신청한 회차는 막는다
assert.equal(partyReason(afternoon), 'APPLIED');
// 대표자만 남기면 대표자 기준으로 막는다
assert.equal(partyReason(morning, [1]), 'APPLIED');
// 한 명은 신청, 한 명은 겹침이면 더할 사람이 없다
assert.equal(
  reason(
    afternoon,
    [
      app('CONFIRMED', 2, 'PREREGISTER', 1),
      app('CONFIRMED', 3, 'PREREGISTER', 2),
    ],
    [1, 2],
  ),
  'NO_PARTICIPANT',
);
// 기간·마감은 참석자와 무관하게 막는다
assert.equal(partyReason(closed), 'CLOSED');
assert.equal(partyReason(past), 'ENDED');
// 서로 다른 회차를 신청한 일행: 동행자(3)만 오전을 신청했다
const split = [
  app('CONFIRMED', 2, 'PREREGISTER', 1),
  app('CONFIRMED', 1, 'PREREGISTER', 3),
];
assert.equal(reason(morning, split, [1, 3]), null);
assert.equal(reason(afternoon, split, [1, 3]), null);
assert.equal(getParticipantBlockReason(morning, sessions, split, 3), 'APPLIED');
assert.equal(getParticipantBlockReason(morning, sessions, split, 1), null);

// 현재 신청(applied)이 하나라도 있어야 지금 일행이다(#775)
const applied = (participantId: number, value: boolean) => ({
  participantId,
  applied: value,
});
const history = [
  // 동행자 2: 사전등록을 모두 취소
  applied(2, false),
  applied(2, false),
  // 동행자 3: 사전등록 하나만 취소하고 하나는 남음
  applied(3, false),
  applied(3, true),
  // 동행자 4: 사전등록은 취소했지만 프로그램 신청이 남음
  applied(4, false),
  applied(4, true),
];
assert.equal(isCurrentParticipant(history, 2), false);
assert.equal(isCurrentParticipant(history, 3), true);
assert.equal(isCurrentParticipant(history, 4), true);
// 신청 내역이 없는 참가자도 지금 일행이 아니다
assert.equal(isCurrentParticipant(history, 5), false);

console.log('ok');
