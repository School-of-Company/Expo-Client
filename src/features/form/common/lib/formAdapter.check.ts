/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/form/common/lib/formAdapter.check.ts`
 */
import assert from 'node:assert/strict';
import { evaluateVisibility } from '../../renderer/lib/visibilityEngine';
import { adaptDynamicFormToSchema } from './formAdapter';
import type { DynamicFormItem } from '@/shared/types/application/type';

const parent = (formType: 'MULTIPLE' | 'DROPDOWN'): DynamicFormItem => ({
  id: 10,
  title: '부모',
  formType,
  jsonData: { '1': 'A', '2': 'B', '3': 'C' },
  requiredStatus: false,
  otherJson: null,
});
const child = (triggerValues: string[]): DynamicFormItem => ({
  id: 11,
  title: '자식',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: false,
  otherJson: { hasEtc: false, conditional: { parentIndex: 0, triggerValues } },
});
const visible = (
  parentType: 'MULTIPLE' | 'DROPDOWN',
  triggers: string[],
  answer: string | string[],
) => {
  const schema = adaptDynamicFormToSchema([
    parent(parentType),
    child(triggers),
  ]);
  return evaluateVisibility(schema.items[1].logic, { '10': answer });
};

// 복수 선택 부모: 배열 답 중 하나라도 trigger에 있으면 보인다.
assert.equal(visible('MULTIPLE', ['1', '2'], ['1']), true);
assert.equal(visible('MULTIPLE', ['1', '2'], ['3', '2']), true);
assert.equal(visible('MULTIPLE', ['1', '2'], ['3']), false);
assert.equal(visible('MULTIPLE', ['1', '2'], []), false);
// 단일 선택 부모는 기존대로 `in`.
assert.equal(visible('DROPDOWN', ['1', '2'], '2'), true);
assert.equal(visible('DROPDOWN', ['1', '2'], '3'), false);
// trigger가 비어 있으면 숨긴다.
assert.equal(visible('MULTIPLE', [], ['1']), false);

// 직업 선택지는 서버(jsonb)가 바꾼 키 순서 대신 고정 순서로 보이고, 교직원은 숨긴다
const occupation = adaptDynamicFormToSchema([
  {
    id: 20,
    title: '참가 유형',
    formType: 'DROPDOWN',
    dynamicFormType: 'OCCUPATION',
    jsonData: {
      PARENT: '학부모',
      GENERAL: '일반인',
      TEACHER: '교원',
      SCHOOL_STAFF: '교직원',
      ELEMENTARY_STUDENT: '초등학생',
      HIGH_SCHOOL_STUDENT: '고등학생',
      PRE_SERVICE_TEACHER: '예비교사',
      KINDERGARTEN_STUDENT: '미취학',
      MIDDLE_SCHOOL_STUDENT: '중학생',
    },
    requiredStatus: true,
    otherJson: null,
  },
]);
assert.deepEqual(
  occupation.items[0].options?.map((option) => option.label),
  [
    '미취학',
    '초등학생',
    '중학생',
    '고등학생',
    '교원',
    '예비교사',
    '학부모',
    '일반인',
  ],
);

console.log('formAdapter ok');
