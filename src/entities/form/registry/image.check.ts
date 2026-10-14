/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/registry/image.check.ts`
 */
import assert from 'node:assert/strict';
import {
  IMAGE_MAX_BYTES,
  IMAGE_UPLOADING,
  checkImageFile,
  imageField,
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
const { validate, toAnswer } = imageField;

// 파일 검사
assert.equal(checkImageFile({ name: 'a.PNG', size: 1 }), undefined);
assert.equal(
  checkImageFile({ name: 'a.webp', size: IMAGE_MAX_BYTES }),
  undefined,
);
assert.notEqual(checkImageFile({ name: 'a.gif', size: 1 }), undefined);
assert.notEqual(checkImageFile({ name: 'noext', size: 1 }), undefined);
assert.notEqual(
  checkImageFile({ name: 'a.jpg', size: IMAGE_MAX_BYTES + 1 }),
  undefined,
);

// 필수·업로드 중
assert.equal(validate(item(true), '', ''), '이미지를 올려주세요');
assert.equal(validate(item(false), '', ''), undefined);
assert.equal(
  validate(item(false), IMAGE_UPLOADING, ''),
  '이미지를 업로드하는 중입니다',
);
assert.equal(validate(item(true), 'https://cdn/a.png', ''), undefined);

// 답변: 빈 값·업로드 중이면 뺀다(Form이 빈 문자열을 거부한다)
assert.equal(
  toAnswer(item(true), 'https://cdn/a.png', ''),
  'https://cdn/a.png',
);
assert.equal(toAnswer(item(true), IMAGE_UPLOADING, ''), undefined);
assert.equal(toAnswer(item(false), '', ''), undefined);

console.log('image.check: ok');
