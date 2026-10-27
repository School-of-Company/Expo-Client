/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/liveSeats.check.ts`
 */
import assert from 'node:assert/strict';
import {
  fromPreRegisterCapacity,
  fromProgramSeats,
  getAgoLabel,
  getSeatStatus,
  getSeatSummary,
  isCacheable,
} from './liveSeats.ts';
import type { SeatGroup } from './liveSeats.ts';

const pre = (over = {}, closed = false) =>
  fromPreRegisterCapacity(
    {
      remaining: 12,
      confirmed: 88,
      waiting: 0,
      appliedWaitingCapacity: 10,
      waitingRemaining: 10,
      maxWaitingApplicants: 5,
      ...over,
    },
    closed,
  );
const entry = (seats: ReturnType<typeof pre> | null, closed = false) => ({
  id: 1,
  closed,
  seats,
});

// 사전등록: 정원은 서버가 주지 않아 확정+잔여로 구한다
assert.equal(pre().capacity, 100);
assert.equal(getSeatStatus(entry(pre())), 'OPEN');
assert.deepEqual(getSeatSummary(pre()), [
  '정원 100명 · 대기 정원 10명',
  '확정 88명 · 대기 0명 · 잔여 12석',
]);
// 대기열이 있거나 마감이면 remaining 이 0 으로 눌려 정원을 알 수 없다
assert.equal(pre({ remaining: 0, waiting: 3 }).capacity, null);
assert.equal(pre({}, true).capacity, null);
// 확정이 찼으면 대기 신청 가능, 대기도 못 받으면 정원 마감
assert.equal(
  getSeatStatus(entry(pre({ remaining: 0, confirmed: 100 }))),
  'WAITING_OPEN',
);
assert.equal(
  getSeatStatus(
    entry(pre({ remaining: 0, confirmed: 100, maxWaitingApplicants: 0 })),
  ),
  'FULL',
);
// 관리자 마감·기간 종료는 숫자와 상관없이 마감, 조회 실패는 확인 불가
assert.equal(getSeatStatus(entry(pre(), true)), 'CLOSED');
assert.equal(getSeatStatus(entry(null, true)), 'CLOSED');
assert.equal(getSeatStatus(entry(null)), 'UNKNOWN');

// 대상별 정원 회차: 교사 쪽은 잔여 있음/마감만, 숫자는 그 외 대상만
const target = pre({
  remaining: null,
  confirmed: null,
  targetSeats: { teacherAvailable: false, nonTeacherRemaining: 7 },
});
assert.equal(target.capacity, null);
assert.equal(getSeatStatus(entry(target)), 'OPEN');
assert.deepEqual(getSeatSummary(target), [
  '대기 정원 10명',
  '대기 0명 · 교사·예비교사 마감 · 그 외 잔여 7석',
]);
assert.equal(
  getSeatStatus(
    entry(
      pre({
        remaining: null,
        confirmed: null,
        maxWaitingApplicants: 0,
        targetSeats: { teacherAvailable: false, nonTeacherRemaining: 0 },
      }),
    ),
  ),
  'FULL',
);

// 프로그램: 사전·현장이 나뉜 회차는 사전 숫자, 대기는 대기 정원 기준
const cap = (capacity: number, confirmedCount: number, w = 0, wc = 5) => ({
  capacity,
  confirmedCount,
  remaining: capacity - confirmedCount,
  waitingCapacity: wc,
  waitingCount: w,
  waitingRemaining: wc - w,
});
const split = fromProgramSeats({
  programId: 3,
  closed: false,
  capacity: cap(150, 40),
  admissionSeats: { preRegistration: cap(100, 40) },
});
assert.equal(split.seats?.capacity, 100);
assert.equal(split.seats?.remaining, 60);
assert.equal(getSeatStatus(split), 'OPEN');
assert.equal(
  getSeatStatus(
    fromProgramSeats({ programId: 3, closed: false, capacity: cap(10, 10) }),
  ),
  'WAITING_OPEN',
);
assert.equal(
  getSeatStatus(
    fromProgramSeats({
      programId: 3,
      closed: false,
      capacity: cap(10, 10, 5),
    }),
  ),
  'FULL',
);
assert.equal(
  getSeatStatus(
    fromProgramSeats({ programId: 3, closed: true, capacity: cap(10, 1) }),
  ),
  'CLOSED',
);
// 형식이 어긋난 응답은 숫자를 지어내지 않고 던진다(그 회차는 확인 불가가 된다)
assert.throws(() =>
  fromProgramSeats({
    programId: 3,
    closed: false,
    capacity: { ...cap(10, 1), confirmedCount: undefined as never },
  }),
);

// 실패가 섞이면 캐시하지 않는다. 닫힌 회차는 숫자를 안 받아도 실패가 아니다
const ok: SeatGroup = { status: 'ok', sessions: [entry(pre())] };
const live = (preRegister = ok, programs = ok) => ({
  fetchedAt: '',
  preRegister,
  programs: {
    STANDARD: programs,
    TRAINING: { status: 'unsupported' as const, sessions: [] },
  },
});
assert.equal(isCacheable(live()), true);
assert.equal(
  isCacheable(live({ status: 'ok', sessions: [entry(null, true)] })),
  true,
);
assert.equal(
  isCacheable(live({ status: 'ok', sessions: [entry(null)] })),
  false,
);
assert.equal(isCacheable(live(ok, { status: 'error', sessions: [] })), false);

// N초 전 갱신
assert.equal(getAgoLabel(1000, 8500), '7초 전 갱신');
assert.equal(getAgoLabel(1000, 500), '0초 전 갱신');
assert.equal(getAgoLabel(0, 125_000), '2분 전 갱신');
