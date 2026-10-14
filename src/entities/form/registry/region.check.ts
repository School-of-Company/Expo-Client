/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/registry/region.check.ts`
 */
import assert from 'node:assert/strict';
import { regionField } from './region';
import type { DynamicFormItem } from '@/shared/types/application/type';

const item = (requiredStatus: boolean): DynamicFormItem => ({
  id: 1,
  title: '지역',
  formType: 'REGION',
  jsonData: {},
  requiredStatus,
  otherJson: null,
});
const { validate, toAnswer, defaultValue } = regionField;

assert.equal(defaultValue(item(true)), '');
// 필수 여부
assert.equal(validate(item(true), '', ''), '지역을 선택해주세요');
assert.equal(validate(item(false), '', ''), undefined);
// 서버 Region enum 키만 받는다
assert.equal(validate(item(true), 'GWANGJU', ''), undefined);
assert.equal(validate(item(true), '광주', ''), '지역을 다시 선택해주세요');

assert.equal(toAnswer(item(true), 'JEONNAM', ''), 'JEONNAM');
// 비었거나 enum이 아니면 답을 뺀다
assert.equal(toAnswer(item(false), '', ''), undefined);
assert.equal(toAnswer(item(false), '광주광역시 북구', ''), undefined);

console.log('region.check: ok');
