import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getProgramStatusBoundaries,
  getProgramStatusLines,
} from './programStatus';
import type { ScheduleProgram } from '../../common';

const at = (iso: string) => new Date(iso).getTime();

const program = (
  policy: Partial<NonNullable<ScheduleProgram['policy']>> | null,
  pendingRevision: number | null = null,
) =>
  ({
    pendingRevision,
    policy: policy && {
      closed: false,
      applicationStartedAt: '2026-10-26T08:30:00+09:00',
      applicationEndedAt: '2026-10-30T23:55:00+09:00',
      ...policy,
    },
  }) as Pick<ScheduleProgram, 'pendingRevision' | 'policy'>;

const labels = (p: ReturnType<typeof program>, now: string) =>
  getProgramStatusLines(p, at(now)).map(({ label }) => label);

test('모집 시작 전에는 접수 전이다', () => {
  assert.deepEqual(labels(program({}), '2026-10-20T10:00:00+09:00'), [
    '접수 전',
  ]);
});

test('시작 시각 정각부터 모집 중이고 종료 시각 정각부터 마감이다', () => {
  assert.deepEqual(labels(program({}), '2026-10-26T08:29:59+09:00'), [
    '접수 전',
  ]);
  assert.deepEqual(labels(program({}), '2026-10-26T08:30:00+09:00'), [
    '모집 중',
  ]);
  assert.deepEqual(labels(program({}), '2026-10-30T23:54:59+09:00'), [
    '모집 중',
  ]);
  assert.deepEqual(labels(program({}), '2026-10-30T23:55:00+09:00'), ['마감']);
});

test('명시적 마감·변경 처리 중·정책 없음은 기간보다 앞선다', () => {
  const during = '2026-10-27T10:00:00+09:00';
  assert.deepEqual(labels(program({ closed: true }), during), ['마감']);
  assert.deepEqual(labels(program({}, 3), during), ['변경 처리 중']);
  assert.deepEqual(labels(program(null), during), ['정책 없음']);
  // 모집 시작 전이어도 변경 처리 중·정책 없음은 그대로다
  assert.deepEqual(labels(program({}, 3), '2026-10-20T10:00:00+09:00'), [
    '변경 처리 중',
  ]);
});

test('현장 접수 기간이 있으면 사전·현장을 나눠 표시한다', () => {
  const both = program({
    onsiteStartedAt: '2026-10-31T09:30:00+09:00',
    onsiteEndedAt: '2026-10-31T16:00:00+09:00',
  });
  assert.deepEqual(labels(both, '2026-10-27T10:00:00+09:00'), [
    '사전 모집 중',
    '현장 접수 전',
  ]);
  assert.deepEqual(labels(both, '2026-10-31T10:00:00+09:00'), [
    '사전 마감',
    '현장 모집 중',
  ]);
  // 명시적 마감은 두 채널 모두에 적용되는 한 줄이다
  assert.deepEqual(
    labels(
      program({
        closed: true,
        onsiteStartedAt: '2026-10-31T09:30:00+09:00',
        onsiteEndedAt: '2026-10-31T16:00:00+09:00',
      }),
      '2026-10-27T10:00:00+09:00',
    ),
    ['마감'],
  );
});

test('모집 기간 경계 시각을 모은다', () => {
  assert.equal(
    getProgramStatusBoundaries([program({}), program(null)]).length,
    2,
  );
});
