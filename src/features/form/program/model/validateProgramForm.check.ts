/**
 * 자체 점검: `node --experimental-strip-types src/features/form/program/model/validateProgramForm.check.ts`
 */
import assert from 'node:assert/strict';
import { validateProgramForm } from './validateProgramForm.ts';
import type { DynamicFieldRequest } from '@/shared/types/form/create/type';

const field = (partial: Partial<DynamicFieldRequest>): DynamicFieldRequest => ({
  title: '질문',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: false,
  otherJson: null,
  ...partial,
});

// 보낼 수 있는 폼은 문제가 없다
assert.deepEqual(
  validateProgramForm([
    field({ title: '이름' }),
    field({ title: '반', formType: 'DROPDOWN', jsonData: { '1': '1반' } }),
    field({ title: '동의', formType: 'CHECKBOX' }),
  ]),
  [],
);

// 쓸 수 없는 필드 유형
assert.equal(validateProgramForm([field({ formType: 'COMPANION' })]).length, 1);
assert.equal(validateProgramForm([field({ formType: 'REGION' })]).length, 1);
assert.equal(validateProgramForm([field({ formType: 'IMAGE' })]).length, 1);

// 기타 입력
assert.equal(
  validateProgramForm([
    field({
      formType: 'MULTIPLE',
      jsonData: { '1': '가' },
      otherJson: { hasEtc: true },
    }),
  ]).length,
  1,
);

// 제목 중복
assert.equal(
  validateProgramForm([field({ title: '이름' }), field({ title: '이름' })])
    .length,
  1,
);

// 선택지가 없는 DROPDOWN·MULTIPLE
assert.equal(validateProgramForm([field({ formType: 'DROPDOWN' })]).length, 1);
assert.equal(validateProgramForm([field({ formType: 'MULTIPLE' })]).length, 1);

// 선택지를 가질 수 없는 필드의 jsonData
assert.equal(
  validateProgramForm([
    field({ formType: 'SENTENCE', jsonData: { '1': '가' } }),
  ]).length,
  1,
);

console.log('validateProgramForm checks passed');
