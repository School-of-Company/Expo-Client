/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/lib/process/buildSurveyAnswers.check.ts`
 */
import assert from 'node:assert/strict';
import { buildSurveyAnswers } from './buildSurveyAnswers';
import type { DynamicFormItem } from '@/shared/types/application/type';

const item = (
  id: number,
  conditional?: { parentIndex: number; triggerValue: string },
): DynamicFormItem => ({
  id,
  title: `Q${id}`,
  formType: id === 3 ? 'SENTENCE' : 'DROPDOWN',
  jsonData: { '1': '예', '2': '아니오' },
  requiredStatus: true,
  otherJson: conditional ? { hasEtc: false, conditional } : null,
});

// Q2 는 Q1=1 일 때, Q3 는 Q2=1 일 때 보인다
const items = [
  item(1),
  item(2, { parentIndex: 0, triggerValue: '1' }),
  item(3, { parentIndex: 1, triggerValue: '1' }),
];

// Q1 을 바꿔 Q2 가 숨으면 Q2 의 옛 값이 남아 있어도 Q3 도 빠진다(#727)
assert.deepEqual(buildSurveyAnswers({ 1: '2', 2: '1', 3: 'foo' }, items), {
  1: '2',
});
// 연쇄가 모두 맞으면 다 싣는다
assert.deepEqual(buildSurveyAnswers({ 1: '1', 2: '1', 3: 'foo' }, items), {
  1: '1',
  2: '1',
  3: 'foo',
});
// 바로 위 부모만 숨으면
assert.deepEqual(buildSurveyAnswers({ 1: '1', 2: '2', 3: 'foo' }, items), {
  1: '1',
  2: '2',
});
// 부모를 찾을 수 없으면 Form 서버처럼 보이는 것으로 본다
assert.deepEqual(
  buildSurveyAnswers({ 9: 'x' }, [
    {
      ...item(9),
      otherJson: {
        hasEtc: false,
        conditional: { parentIndex: 5, triggerValue: '1' },
      },
    },
  ]),
  { 9: 'x' },
);

console.log('buildSurveyAnswers.check: ok');
