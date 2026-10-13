/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/registry/region.check.ts`
 */
import assert from 'node:assert/strict';
import { regionModel } from './region';
import type { DynamicFormItem } from '@/shared/types/application/type';

const item = (requiredStatus: boolean): DynamicFormItem => ({
  id: 1,
  title: '지역',
  formType: 'REGION',
  jsonData: {},
  requiredStatus,
  otherJson: null,
});
const { validate, serialize } = regionModel;

// 필수 여부
assert.equal(validate(undefined, item(true)), '지역을 선택해주세요');
assert.equal(validate(undefined, item(false)), true);
// 시/도만 고르면 하위 단계를 요구한다(필수가 아니어도)
assert.equal(
  validate({ sido: '광주광역시', sigungu: '' }, item(false)),
  '시/군/구를 선택해주세요',
);
// 하위 단계가 없는 세종은 시/도만으로 끝
assert.equal(
  validate({ sido: '세종특별자치시', sigungu: '' }, item(true)),
  true,
);
// 데이터에 없는 조합
assert.equal(
  validate({ sido: '광주광역시', sigungu: '해운대구' }, item(true)),
  '지역을 다시 선택해주세요',
);
assert.equal(
  validate({ sido: 'GWANGJU', sigungu: '' }, item(true)),
  '지역을 다시 선택해주세요',
);

// 직렬화
assert.equal(
  serialize({ sido: '광주광역시', sigungu: '북구' }, item(true)),
  '광주광역시 북구',
);
assert.equal(
  serialize({ sido: '세종특별자치시', sigungu: '' }, item(true)),
  '세종특별자치시',
);
assert.equal(
  serialize({ sido: '광주광역시', sigungu: '' }, item(true)),
  undefined,
);
assert.equal(serialize(undefined, item(false)), undefined);

console.log('region.check: ok');
