/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/lib/occupationOptions.check.ts`
 */
import assert from 'node:assert/strict';
import { OCCUPATION_OPTIONS } from '../constants/occupationData';
import { getOccupationLabels, toOccupationOptions } from './occupationOptions';
import type { DynamicFormItem } from '@/shared/types/application/type';

const form: Pick<DynamicFormItem, 'dynamicFormType' | 'jsonData'>[] = [
  { dynamicFormType: 'NAME' as const, jsonData: {} },
  {
    dynamicFormType: 'OCCUPATION' as const,
    jsonData: {
      TEACHER: '교사',
      PARENT: { value: '학부모·보호자', isAlwaysSelected: false },
    },
  },
];
const labels = getOccupationLabels(form);
assert.deepEqual(labels, { TEACHER: '교사', PARENT: '학부모·보호자' });

// 폼 정의의 문구와 선택지를 따른다
// (순서는 클라이언트 상수 순서를 따른다)
assert.deepEqual(
  [...toOccupationOptions(labels)].sort((a, b) => a.key.localeCompare(b.key)),
  [
    { key: 'PARENT', label: '학부모·보호자' },
    { key: 'TEACHER', label: '교사' },
  ],
);

// 직업 문항이 없으면 클라이언트 상수 그대로
assert.equal(getOccupationLabels([form[0]]), undefined);
assert.equal(toOccupationOptions(undefined), OCCUPATION_OPTIONS);
console.log('occupationOptions.check: ok');
