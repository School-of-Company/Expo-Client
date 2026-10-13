/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/registry/image.check.ts`
 */
import assert from 'node:assert/strict';
import {
  IMAGE_MAX_BYTES,
  IMAGE_UPLOADING,
  checkImageFile,
  imageModel,
} from './image';
import type { DynamicFormItem } from '@/shared/types/application/type';

const item = (requiredStatus: boolean): DynamicFormItem => ({
  id: 7,
  title: '사진',
  formType: 'IMAGE',
  jsonData: {},
  requiredStatus,
  otherJson: null,
});
const { validate, serialize } = imageModel;

// 파일 검사
assert.equal(checkImageFile({ name: 'a.PNG', size: 1 }), true);
assert.equal(checkImageFile({ name: 'a.webp', size: IMAGE_MAX_BYTES }), true);
assert.notEqual(checkImageFile({ name: 'a.gif', size: 1 }), true);
assert.notEqual(checkImageFile({ name: 'noext', size: 1 }), true);
assert.notEqual(
  checkImageFile({ name: 'a.jpg', size: IMAGE_MAX_BYTES + 1 }),
  true,
);

// 필수·업로드 중
assert.equal(validate(undefined, item(true)), '이미지를 올려주세요');
assert.equal(validate('', item(false)), true);
assert.equal(
  validate(IMAGE_UPLOADING, item(false)),
  '이미지를 업로드하는 중입니다',
);
assert.equal(validate('https://cdn/a.png', item(true)), true);

// 직렬화
assert.equal(serialize('https://cdn/a.png', item(true)), 'https://cdn/a.png');
assert.equal(serialize(IMAGE_UPLOADING, item(true)), undefined);
assert.equal(serialize('', item(false)), undefined);

console.log('image.check: ok');
