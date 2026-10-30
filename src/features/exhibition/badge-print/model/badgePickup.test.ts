import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBadgePickupSettled, toBadgePickup } from './badgePickup';

const job = (
  status: string,
  station: { stationId: string; label: string } | null,
) =>
  ({ jobId: 1, currentJobId: 1, status, station }) as Parameters<
    typeof toBadgePickup
  >[0];

test('배정 전은 배정 중, 점유하면 출력대 이름', () => {
  assert.deepEqual(toBadgePickup(job('WAITING', null), false), {
    kind: 'assigning',
  });
  assert.deepEqual(toBadgePickup(undefined, false), { kind: 'assigning' });
  const claimed = job('CLAIMED', { stationId: 's', label: '출력대 2' });
  assert.deepEqual(toBadgePickup(claimed, false), {
    kind: 'assigned',
    label: '출력대 2',
  });
  assert.ok(isBadgePickupSettled(claimed));
});

test('실패·확인 필요·조회 오류는 구분하고 SUBMITTED 를 완료로 쓰지 않는다', () => {
  assert.equal(toBadgePickup(job('FAILED', null), false).kind, 'needsCheck');
  assert.equal(
    toBadgePickup(job('NEEDS_CHECK', null), false).kind,
    'needsCheck',
  );
  assert.equal(toBadgePickup(undefined, true).kind, 'error');
  assert.equal(toBadgePickup(job('SUBMITTED', null), false).kind, 'assigning');
  assert.ok(!isBadgePickupSettled(job('WAITING', null)));
  // 처리 완료는 station 이 null 이어도 배정 대기로 남지 않는다
  assert.equal(toBadgePickup(job('DONE', null), false).kind, 'done');
  assert.ok(isBadgePickupSettled(job('DONE', null)));
});
