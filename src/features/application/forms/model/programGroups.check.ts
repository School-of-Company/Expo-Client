/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/programGroups.check.ts`
 */
import assert from 'node:assert/strict';
import { getGroupApplications, groupPrograms } from './programGroups.ts';

const p = (
  id: number,
  title: string,
  groupId: string | null,
  startedAt: string,
  type = 'TRAINING',
) =>
  ({ id, title, groupId, programType: type, policy: null, startedAt }) as never;
const app = (
  participantId: number,
  sessionOrProgramId: number,
  status: string,
  type = 'TRAINING',
) =>
  ({
    applicationId: `a${participantId}${sessionOrProgramId}`,
    type,
    participantId,
    sessionOrProgramId,
    status,
  }) as never;

// 같은 그룹/다른 제목은 한 묶음, 다른 그룹/같은 제목은 별도 묶음, 그룹 없음은 독립
const groups = groupPrograms([
  p(1, 'A', 'g1', '2026-10-02T10:00'),
  p(2, 'B', 'g1', '2026-10-01T10:00'),
  p(3, 'A', 'g2', '2026-10-01T10:00'),
  p(4, 'A', null, '2026-10-01T10:00'),
  p(5, 'A', '  ', '2026-10-01T10:00'),
  p(6, 'A', 'g1', '2026-10-01T10:00', 'STANDARD'),
]);
assert.equal(groups.length, 5);
assert.deepEqual(
  groups[0].sessions.map((s) => s.id),
  [2, 1],
); // 시작 시각순
assert.deepEqual(
  groups.map((g) => g.sessions.length),
  [2, 1, 1, 1, 1],
);

// 대표자·동행자가 서로 다른 회차를 신청: 참가자별로 정확히 표시
const members = [
  { participantId: 10, name: '대표' },
  { participantId: 11, name: '동행' },
];
const found = getGroupApplications(
  groups[0],
  'TRAINING',
  [
    app(10, 1, 'CONFIRMED'),
    app(11, 2, 'WAITING'),
    app(10, 3, 'CONFIRMED'), // 다른 그룹
    app(11, 1, 'CANCELLED'), // 취소는 제외
    app(11, 2, 'CONFIRMED', 'STANDARD'), // 다른 타입
  ],
  members,
);
assert.deepEqual(
  found.map((f) => [f.participantName, f.session.id, f.application.status]),
  [
    ['대표', 1, 'CONFIRMED'],
    ['동행', 2, 'WAITING'],
  ],
);
console.log('ok');
