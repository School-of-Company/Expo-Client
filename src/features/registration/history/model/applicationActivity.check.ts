/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/registration/history/model/applicationActivity.check.ts`
 */
import assert from 'node:assert/strict';
import { getActivityActorLabel } from './applicationActivity';

const user = (
  actorUser: Parameters<typeof getActivityActorLabel>[0]['actorUser'],
) => getActivityActorLabel({ actorType: 'USER', actorId: null, actorUser });

assert.equal(
  user({
    participantId: 3,
    reservationRequestId: null,
    role: 'REPRESENTATIVE',
    name: '김대표',
    nameSource: 'CURRENT_USER',
  }),
  '사용자 · 김대표 #3',
);
// 이름 조회 실패
assert.equal(
  user({
    participantId: 3,
    reservationRequestId: null,
    role: 'REPRESENTATIVE',
    name: null,
    nameSource: 'CURRENT_USER',
  }),
  '사용자 · #3',
);
// 대기 예약 실행자
assert.equal(
  user({
    participantId: null,
    reservationRequestId: 'r-1',
    role: 'REPRESENTATIVE',
    name: '박대기',
    nameSource: 'REGISTRATION_SNAPSHOT',
  }),
  '사용자 · 박대기',
);
assert.equal(
  user({
    participantId: null,
    reservationRequestId: 'r-1',
    role: 'REPRESENTATIVE',
    name: null,
    nameSource: 'REGISTRATION_SNAPSHOT',
  }),
  '사용자 · 대기 예약 대표자',
);
// 과거 이력·신청 이력
assert.equal(user(null), '사용자 · 처리자 미기록');
assert.equal(user(undefined), '사용자 · 처리자 미기록');
assert.equal(
  getActivityActorLabel({ actorType: 'ADMIN', actorId: 9, actorUser: null }),
  '관리자 #9',
);
assert.equal(
  getActivityActorLabel({ actorType: 'UNKNOWN', actorId: null }),
  '미기록',
);

console.log('applicationActivity.check: ok');
