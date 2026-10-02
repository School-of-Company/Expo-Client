/**
 * 자체 점검: `node --experimental-strip-types src/features/application/lib/process/resolveFieldValue.check.ts`
 */
import assert from 'node:assert/strict';
import { getFieldId, resolveFieldValue } from './resolveFieldValue.ts';
import type { DynamicFormItem } from '@/shared/types/application/type';

const QUESTION_ID = '11111111-1111-1111-1111-111111111111';
const OPTION_A = '22222222-2222-2222-2222-222222222222';

const select: DynamicFormItem = {
  title: '참여 동기',
  formType: 'CHECKBOX',
  jsonData: JSON.stringify({
    id: QUESTION_ID,
    options: [
      { id: OPTION_A, label: '홍보물', value: '1' },
      { id: 'opt-b', label: '지인 추천', value: '2' },
    ],
  }),
  requiredStatus: true,
  otherJson: null,
};

const sentence: DynamicFormItem = {
  title: '이름',
  formType: 'SENTENCE',
  jsonData: JSON.stringify({ id: QUESTION_ID }),
  requiredStatus: true,
  otherJson: null,
};

assert.equal(getFieldId(select), QUESTION_ID);

// 선택지 UUID는 라벨로 복원된다
assert.deepEqual(resolveFieldValue({ [QUESTION_ID]: [OPTION_A] }, select), [
  '홍보물',
]);

// 기타 선택 시 `${id}_etc` 입력값으로 치환된다
assert.deepEqual(
  resolveFieldValue(
    { [QUESTION_ID]: [OPTION_A, '기타'], [`${QUESTION_ID}_etc`]: '직접 입력' },
    select,
  ),
  ['홍보물', '직접 입력'],
);

// 단일 선택도 동일하게 동작한다
assert.equal(resolveFieldValue({ [QUESTION_ID]: OPTION_A }, select), '홍보물');

// 선택지가 없는 질문은 입력값을 그대로 돌려준다
assert.equal(
  resolveFieldValue({ [QUESTION_ID]: '문강현' }, sentence),
  '문강현',
);

// 미입력/깨진 jsonData 는 undefined
assert.equal(resolveFieldValue({}, sentence), undefined);
assert.equal(
  resolveFieldValue({ a: 'b' }, { ...sentence, jsonData: '{' }),
  undefined,
);

console.log('resolveFieldValue checks passed');
