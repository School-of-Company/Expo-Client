/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/applicationSections.check.ts`
 */
import assert from 'node:assert/strict';
import {
  PROGRAM_CATEGORIES,
  TRAINING_CATEGORIES,
  filterByCategory,
  getSessionLabel,
  getSessionTopic,
  groupByCategory,
} from './applicationSections.ts';
import type { Program } from '@/shared/types/program/list/type';

const p = (id: number, title: string, startedAt: string) =>
  ({ id, title, startedAt }) as Program;

// dev 박람회의 실제 제목
const programs = [
  p(26, 'AI교육원 전시체험 투어(1회차)', '2026-10-31T10:30'),
  p(27, '기조 강연', '2026-10-31T11:00'),
  p(28, '초등 골든벨', '2026-10-31T13:30'),
  p(29, 'AI교육원 전시체험 투어(2회차)', '2026-10-31T13:30'),
  p(31, '중·고등 골든벨', '2026-11-01T11:00'),
  p(40, '특별 체험', '2026-10-31T09:00'),
];
const groups = groupByCategory(programs, PROGRAM_CATEGORIES);
assert.deepEqual(
  groups.map((g) => [g.label, g.sessions.map((s) => s.id)]),
  [
    ['기조강연', [27]],
    ['AI·SW 골든벨', [28, 31]],
    ['AI교육원 전시체험 투어', [26, 29]],
    // 분류에 안 맞는 프로그램은 제목 그대로 독립 카드
    ['특별 체험', [40]],
  ],
);

const trainings = [
  p(
    13,
    '(삼성 1회차) 선생님을 대상으로 하는 갤럭시 AI클래스 수업',
    '2026-10-31T13:00',
  ),
  p(14, '구글 연수 1회차 · Google AI 교육자 과정', '2026-10-31T14:00'),
  p(16, '애플 연수 1회차 · iPad로 만드는 참여 중심 수업', '2026-10-31T16:00'),
  p(15, '삼성 연수 2회차 · 효율 UP! AI•디지털 활용 수업', '2026-10-31T15:00'),
];
assert.deepEqual(
  groupByCategory(trainings, TRAINING_CATEGORIES).map((g) => [
    g.label,
    g.sessions.map((s) => s.id),
  ]),
  [
    ['삼성 연수', [13, 15]],
    ['구글 연수', [14]],
    ['애플 연수', [16]],
  ],
);
// 분류 key 로 그 분류의 회차만 남긴다
assert.deepEqual(
  filterByCategory(trainings, TRAINING_CATEGORIES, 'samsung').map((x) => x.id),
  [13, 15],
);
assert.equal(
  filterByCategory(trainings, TRAINING_CATEGORIES, undefined).length,
  4,
);
// 회차 없는 분류는 카드를 만들지 않는다
assert.equal(groupByCategory([], TRAINING_CATEGORIES).length, 0);

assert.equal(
  getSessionLabel('AI교육원 전시체험 투어(2회차)', 'AI교육원 전시체험 투어'),
  '2회차',
);
assert.equal(getSessionLabel('초등 골든벨', 'AI·SW 골든벨'), '초등');
assert.equal(getSessionLabel('중·고등 골든벨', 'AI·SW 골든벨'), '중·고등');
assert.equal(getSessionLabel('기조 강연', '기조강연'), '신청');
assert.equal(getSessionLabel('(삼성 1회차) 갤럭시', '삼성 연수'), '1회차');

assert.equal(getSessionTopic('기조 강연', '기조강연'), '');
assert.equal(
  getSessionTopic('AI교육원 전시체험 투어(1회차)', 'AI교육원 전시체험 투어'),
  '',
);
assert.equal(getSessionTopic('초등 골든벨', 'AI·SW 골든벨'), '');
assert.equal(
  getSessionTopic(
    '삼성 연수 2회차 · 효율 UP! AI•디지털 활용 수업',
    '삼성 연수',
  ),
  '효율 UP! AI•디지털 활용 수업',
);
assert.equal(
  getSessionTopic(
    '(삼성 1회차) 선생님을 대상으로 하는 갤럭시 AI클래스 수업',
    '삼성 연수',
  ),
  '선생님을 대상으로 하는 갤럭시 AI클래스 수업',
);
console.log('applicationSections checks passed');
