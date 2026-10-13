/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/registry/companion.check.ts`
 */
import assert from 'node:assert/strict';
import { companionModel, type CompanionValue } from './companion';
import type { DynamicFormItem } from '@/shared/types/application/type';

const item = (
  requiredStatus: boolean,
  maxSelection?: number,
): DynamicFormItem => ({
  id: 5,
  title: '동행자',
  formType: 'COMPANION',
  jsonData: {},
  requiredStatus,
  otherJson:
    maxSelection === undefined ? null : { hasEtc: false, maxSelection },
});
const person = (patch: Partial<CompanionValue> = {}): CompanionValue => ({
  name: '홍길동',
  occupation: 'GENERAL',
  region: { sido: '광주광역시', sigungu: '북구' },
  ...patch,
});
const { validate, serialize } = companionModel;

// 인원: 필수면 최소 1명, 최대는 maxSelection(없으면 4)
assert.equal(validate([], item(true)), '동행자을(를) 1명 이상 추가해주세요');
assert.equal(validate(undefined, item(false)), true);
assert.equal(
  validate([person(), person()], item(false, 1)),
  '동행자는 최대 1명입니다',
);
assert.equal(
  validate(Array(5).fill(person()), item(false)),
  '동행자는 최대 4명입니다',
);
assert.equal(validate(Array(4).fill(person()), item(false)), true);
// 폼 정의가 4명을 넘겨도 서버 상한 4명을 따른다
assert.equal(
  validate(Array(5).fill(person()), item(false, 10)),
  '동행자는 최대 4명입니다',
);

// 사람별 항목
assert.equal(
  validate([person({ name: '  ' })], item(false)),
  '동행자 1: 동행자 이름을 입력해주세요',
);
assert.equal(
  validate([person(), person({ occupation: '' })], item(false)),
  '동행자 2: 구분을 선택해주세요',
);
assert.equal(
  validate(
    [person({ region: { sido: '광주광역시', sigungu: '' } })],
    item(false),
  ),
  '동행자 1: 시/군/구를 선택해주세요',
);
// 소속은 교사·예비교사만
assert.equal(
  validate([person({ occupation: 'TEACHER' })], item(false)),
  '동행자 1: 소속을 입력해주세요',
);
assert.equal(
  validate([person({ occupation: 'TEACHER', school: '광주초' })], item(false)),
  true,
);

// 직렬화: 공백 제거, 지역 문자열, 필요 없는 소속 제거
assert.deepEqual(
  serialize(
    [
      person({ name: ' 홍길동 ', occupation: 'TEACHER', school: ' 광주초 ' }),
      person({
        name: '김일반',
        school: '남은 값',
        region: { sido: '세종특별자치시', sigungu: '' },
      }),
    ],
    item(false),
  ),
  [
    {
      name: '홍길동',
      occupation: 'TEACHER',
      region: '광주광역시 북구',
      school: '광주초',
    },
    { name: '김일반', occupation: 'GENERAL', region: '세종특별자치시' },
  ],
);
assert.deepEqual(serialize(undefined, item(false)), []);

console.log('companion.check: ok');
