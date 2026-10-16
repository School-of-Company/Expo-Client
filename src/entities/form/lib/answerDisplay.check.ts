/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/lib/answerDisplay.check.ts`
 */
import assert from 'node:assert/strict';
import { toAnswerDisplay } from './answerDisplay';

const q = (
  id: number,
  title: string,
  formType: string,
  jsonData = {},
  otherJson = null,
) => ({
  id,
  title,
  formType,
  jsonData,
  otherJson,
});
const questions = [
  q(1, '이름', 'SENTENCE'),
  q(
    2,
    '관심 분야',
    'MULTIPLE',
    { a: '로봇', b: { value: 'AI', isAlwaysSelected: true } },
    {
      hasEtc: true,
    } as never,
  ),
  q(3, '과정', 'DROPDOWN', { x: '기초' }),
  q(4, '동의', 'CHECKBOX'),
  q(5, '동행', 'COMPANION'),
  q(6, '미응답', 'SENTENCE'),
];
const answers = {
  '1': '홍길동',
  '2': ['a', 'b', '직접 입력'],
  '3': 'gone',
  '4': true,
  '5': [
    {
      name: '김교사',
      occupation: 'TEACHER',
      region: 'GWANGJU',
      school: '광주초',
    },
  ],
  '99': 'orphan',
};

const { rows, snapshotMissing } = toAnswerDisplay(questions, answers);
const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
assert.equal(snapshotMissing, false);
assert.equal(byId['1'].label, '이름');
assert.equal(byId['1'].text, '홍길동');
// 선택지 키는 당시 라벨로, 라벨에 없는 값은 기타 입력으로
assert.equal(byId['2'].text, '로봇\nAI\n기타: 직접 입력');
// 삭제된 선택지는 키를 숨기지 않고 표시
assert.equal(byId['3'].text, 'gone (당시 선택지 정보 없음)');
assert.equal(byId['4'].text, '예');
assert.equal(byId['5'].text, '김교사 (교사 · 광주 · 광주초)');
assert.equal(byId['6'].text, '답변 없음');
// 스냅샷에 없는 답변은 지우지 않는다
assert.equal(byId['99'].label, '문항 99');
assert.equal(byId['99'].questionMissing, true);

// 스냅샷 null 이어도 답변은 남고, JSON 문자열이 되지 않는다
const missing = toAnswerDisplay(null, { '7': { a: ['x', true] }, '8': 3 });
assert.equal(missing.snapshotMissing, true);
assert.equal(missing.rows[0].text, 'a: x\n예');
assert.equal(missing.rows[1].text, '3');
assert.equal(toAnswerDisplay([], null).rows.length, 0);

console.log('answerDisplay checks passed');
