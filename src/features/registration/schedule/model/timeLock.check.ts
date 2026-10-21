/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/registration/schedule/model/timeLock.check.ts`
 */
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import { ApiError } from '@/shared/libs/http/apiError';
import { toScheduleSaveError } from '../../common/api/scheduleApi';
import { isPreregisterTimeLocked, isProgramTimeLocked } from './timeLock';

const summary = (patch: object) =>
  ({
    sessionId: 1,
    confirmedParticipants: 0,
    cancelledParticipants: 0,
    waitingParticipants: 0,
    pendingReservations: 0,
    ...patch,
  }) as Parameters<typeof isPreregisterTimeLocked>[0];

assert.equal(isPreregisterTimeLocked(undefined), false);
assert.equal(isPreregisterTimeLocked(summary({})), false);
assert.equal(
  isPreregisterTimeLocked(summary({ cancelledParticipants: 1 })),
  true,
);
assert.equal(
  isPreregisterTimeLocked(summary({ waitingParticipants: 2 })),
  true,
);

const sessions = [
  { programType: 'STANDARD', programId: 7, statusCounts: { CONFIRMED: 1 } },
  { programType: 'TRAINING', programId: 7, statusCounts: { CANCELLED: 3 } },
  { programType: 'STANDARD', programId: 8, statusCounts: { WAITING: 1 } },
] as Parameters<typeof isProgramTimeLocked>[1];
assert.equal(
  isProgramTimeLocked({ id: 7, programType: 'STANDARD' }, sessions),
  true,
);
// 취소만 있으면 잠그지 않고, 종류가 다르면 같은 ID 도 다른 회차다
assert.equal(
  isProgramTimeLocked({ id: 7, programType: 'TRAINING' }, sessions),
  false,
);
assert.equal(
  isProgramTimeLocked({ id: 8, programType: 'STANDARD' }, sessions),
  true,
);
assert.equal(
  isProgramTimeLocked({ id: 9, programType: 'STANDARD' }, sessions),
  false,
);
assert.equal(
  isProgramTimeLocked({ id: 7, programType: 'STANDARD' }, undefined),
  false,
);

const conflict = (data: object, status = 409) =>
  new AxiosError('x', undefined, undefined, undefined, {
    status,
    data,
  } as never);

const locked = toScheduleSaveError(
  conflict({ code: 'TIME_LOCKED_BY_HISTORY' }),
  '실패',
);
assert.ok(
  locked instanceof ApiError &&
    locked.message.includes('시간은 바꿀 수 없습니다'),
);
const below = toScheduleSaveError(
  conflict({ code: 'BELOW_WAITING_COUNT' }),
  '실패',
);
assert.ok(below instanceof ApiError && below.message.includes('대기 인원'));
// 모르는 코드나 코드 없는 구버전 응답은 서버 문구를 그대로 둔다
for (const data of [
  { code: 'NEW_CODE', message: '서버 문구' },
  { message: '서버 문구' },
]) {
  const kept = toScheduleSaveError(conflict(data), '실패');
  assert.ok(kept instanceof ApiError && kept.message === '서버 문구');
}
// 409 가 아니면 코드가 있어도 바꾸지 않는다
const other = toScheduleSaveError(
  conflict({ code: 'BELOW_WAITING_COUNT', message: '권한' }, 403),
  '실패',
);
assert.ok(other instanceof ApiError && other.message === '권한');

console.log('timeLock.check OK');
