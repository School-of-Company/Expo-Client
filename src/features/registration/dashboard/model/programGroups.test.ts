import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ProgramSessionDefinition } from '../../common/api/ledgerApi';
import { groupSessionsByProgram } from './programGroups';

const session = (
  id: number,
  title: string,
  groupId?: string,
): ProgramSessionDefinition => ({
  programType: 'STANDARD',
  id,
  title,
  startedAt: `2026-10-0${id}T10:00`,
  endedAt: `2026-10-0${id}T11:00`,
  groupId,
  policy: { capacity: 10, waitingCapacity: 2, closed: false },
});

const summaries = [1, 2].map((programId) => ({
  programType: 'STANDARD' as const,
  programId,
  totalElements: 3,
  uniqueParticipants: 1,
  statusCounts: { CONFIRMED: 2, WAITING: 1 },
  attendance: null,
}));

test('같은 groupId 는 제목이 달라도 합쳐 건수를 더한다', () => {
  const [group, ...rest] = groupSessionsByProgram(
    [session(1, 'A', 'g'), session(2, 'B', 'g')],
    summaries,
  );
  assert.equal(rest.length, 0);
  assert.equal(group.sessionCount, 2);
  assert.equal(group.capacity, 20);
  assert.equal(group.waitingCapacity, 4);
  assert.equal(group.confirmed, 4);
  assert.equal(group.waiting, 2);
});

test('다른 groupId 는 제목이 같아도 나눈다', () => {
  const groups = groupSessionsByProgram(
    [session(1, 'A', 'g1'), session(2, 'A', 'g2')],
    null,
  );
  assert.equal(groups.length, 2);
  assert.equal(groups[0].confirmed, null);
});

test('groupId 없는 동명 회차는 따로 둔다', () => {
  assert.equal(
    groupSessionsByProgram([session(1, 'A'), session(2, 'A')], null).length,
    2,
  );
});
