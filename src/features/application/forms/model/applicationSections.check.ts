/**
 * 자체 점검: `node --experimental-strip-types src/features/application/forms/model/applicationSections.check.ts`
 */
import assert from 'node:assert/strict';
import {
  filterBySeries,
  getSeriesName,
  getSessionLabel,
  groupBySeries,
} from './applicationSections.ts';
import type { Program } from '@/shared/types/program/list/type';

const p = (id: number, title: string, startedAt: string) =>
  ({ id, title, startedAt }) as Program;

// 회차 표기를 뺀 이름
assert.equal(
  getSeriesName('AI교육원 전시체험 투어(1회차)'),
  'AI교육원 전시체험 투어',
);
assert.equal(
  getSeriesName('AI교육원 전시체험 투어 (2 회차)'),
  'AI교육원 전시체험 투어',
);
assert.equal(getSeriesName('코딩 체험 3회차'), '코딩 체험');
assert.equal(
  getSeriesName('구글 연수 1회차 · 교육자 과정'),
  '구글 연수 · 교육자 과정',
);
assert.equal(getSeriesName('(삼성 1회차) 갤럭시 수업'), '(삼성) 갤럭시 수업');
assert.equal(getSeriesName('1회차 - 오전'), '오전');
assert.equal(getSeriesName('기조 강연'), '기조 강연');
// 회차 표기뿐인 제목은 원래 제목
assert.equal(getSeriesName('1회차'), '1회차');

// 2026 박람회 dev 제목. 특정 행사 키워드 없이 이름만으로 묶는다
const programs = [
  p(26, 'AI교육원 전시체험 투어(1회차)', '2026-10-31T10:30'),
  p(27, '기조 강연', '2026-10-31T11:00'),
  p(28, '초등 골든벨', '2026-10-31T13:30'),
  p(29, 'AI교육원 전시체험 투어(2회차)', '2026-10-31T13:30'),
  p(31, '중·고등 골든벨', '2026-11-01T11:00'),
  p(40, '특별 체험', '2026-10-31T09:00'),
];
const groups = groupBySeries(programs);
assert.deepEqual(
  groups.map((g) => [g.key, g.label, g.sessions.map((s) => s.id)]),
  [
    // 카드는 첫 회차 시작 순
    ['특별 체험', '특별 체험', [40]],
    ['AI교육원 전시체험 투어', 'AI교육원 전시체험 투어', [26, 29]],
    ['기조 강연', '기조 강연', [27]],
    ['초등 골든벨', '초등 골든벨', [28]],
    ['중·고등 골든벨', '중·고등 골든벨', [31]],
  ],
);
assert.equal(groupBySeries([]).length, 0);

// 카드 key 로 그 카드의 회차만 남긴다
assert.deepEqual(
  filterBySeries(programs, 'AI교육원 전시체험 투어').map((x) => x.id),
  [26, 29],
);
assert.equal(filterBySeries(programs, undefined).length, programs.length);
// 모르는 key(예전에 공유된 링크)는 빈 목록 대신 전체
assert.equal(filterBySeries(programs, 'samsung').length, programs.length);
assert.equal(filterBySeries(programs, 'other:26').length, programs.length);

assert.equal(getSessionLabel('AI교육원 전시체험 투어(2회차)'), '2회차');
assert.equal(getSessionLabel('(삼성 1회차) 갤럭시'), '1회차');
assert.equal(getSessionLabel('기조 강연'), '신청');

console.log('applicationSections checks passed');
