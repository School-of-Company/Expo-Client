/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/entities/form/registry/companion.check.ts`
 */
import assert from 'node:assert/strict';
import { companionField } from './companion';
import type {
  Companion,
  DynamicFormItem,
} from '@/shared/types/application/type';

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
const person = (patch: Partial<Companion> = {}): Companion => ({
  name: '홍길동',
  occupation: 'GENERAL',
  region: 'GWANGJU',
  ...patch,
});
const { validate, toAnswer, defaultValue } = companionField;

assert.deepEqual(defaultValue(item(false)), []);

// 인원: 필수면 최소 1명, 최대는 maxSelection(없으면 4)이고 4를 넘지 않는다
assert.equal(validate(item(true), [], ''), '동행자를 1명 이상 추가해주세요');
assert.equal(validate(item(false), [], ''), undefined);
assert.equal(
  validate(item(false, 1), [person(), person()], ''),
  '동행자는 최대 1명입니다',
);
assert.equal(validate(item(false), Array(4).fill(person()), ''), undefined);
assert.equal(
  validate(item(false, 10), Array(5).fill(person()), ''),
  '동행자는 최대 4명입니다',
);

// 사람별 항목
assert.equal(
  validate(item(false), [person({ name: '  ' })], ''),
  '동행자 1: 이름을 입력해주세요',
);
assert.equal(
  validate(item(false), [person(), person({ occupation: '' })], ''),
  '동행자 2: 구분을 선택해주세요',
);
assert.equal(
  validate(item(false), [person({ region: '' })], ''),
  '동행자 1: 지역을 선택해주세요',
);
// 소속은 교사·예비교사만
assert.equal(
  validate(item(false), [person({ occupation: 'TEACHER' })], ''),
  '동행자 1: 소속을 입력해주세요',
);
assert.equal(
  validate(
    item(false),
    [person({ occupation: 'TEACHER', school: '광주초' })],
    '',
  ),
  undefined,
);

// 답변: 공백 제거, 필요 없는 소속 제거, 0명이면 뺀다
assert.deepEqual(
  toAnswer(
    item(false),
    [
      person({ name: ' 홍길동 ', occupation: 'TEACHER', school: ' 광주초 ' }),
      person({ name: '김일반', school: '남은 값', region: 'OTHER' }),
    ],
    '',
  ),
  [
    {
      name: '홍길동',
      occupation: 'TEACHER',
      region: 'GWANGJU',
      school: '광주초',
    },
    { name: '김일반', occupation: 'GENERAL', region: 'OTHER' },
  ],
);
assert.equal(toAnswer(item(false), [], ''), undefined);

console.log('companion.check: ok');
