/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/form-fill/lib/toSubmitPayload.check.ts`
 */
import assert from 'node:assert/strict';
import { ETC_KEY } from '@/entities/form/registry';
import {
  getDefaultValues,
  toSubmitPayload,
  validateForm,
} from './toSubmitPayload';
import type { DynamicFormItem } from '@/shared/types/application/type';

const name: DynamicFormItem = {
  id: 1,
  title: '이름',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: true,
  otherJson: null,
  dynamicFormType: 'NAME',
};

const phone: DynamicFormItem = {
  id: 2,
  title: '전화번호',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: true,
  otherJson: null,
  dynamicFormType: 'PHONE_NUMBER',
};

const motive: DynamicFormItem = {
  id: 3,
  title: '참여 동기',
  formType: 'MULTIPLE',
  jsonData: {
    '1': '홍보물',
    '2': { value: '지인 추천', isAlwaysSelected: true },
    '3': '기사',
  },
  requiredStatus: true,
  otherJson: { hasEtc: true, maxSelection: 2 },
};

const occupation: DynamicFormItem = {
  id: 4,
  title: '직업',
  formType: 'DROPDOWN',
  jsonData: { TEACHER: '교사', PARENT: '학부모' },
  requiredStatus: true,
  otherJson: { hasEtc: true },
};

const school: DynamicFormItem = {
  id: 5,
  title: '소속 학교',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: true,
  otherJson: {
    hasEtc: false,
    conditional: { parentIndex: 3, triggerValues: ['TEACHER'] },
  },
};

const agree: DynamicFormItem = {
  id: 6,
  title: '수신 동의',
  formType: 'CHECKBOX',
  jsonData: {},
  requiredStatus: false,
  otherJson: null,
};

const image: DynamicFormItem = {
  id: 7,
  title: '사진',
  formType: 'IMAGE',
  jsonData: {},
  requiredStatus: true,
  otherJson: null,
};

const items = [name, phone, motive, occupation, school, agree, image];

// 항상 선택 선택지는 기본값에 들어간다
assert.deepEqual(getDefaultValues(items), {
  '1': '',
  '2': '',
  '3': ['2'],
  '4': '',
  '5': '',
  '6': false,
  '7': '',
});

// 보이는 필수 문항만 검증한다. 학교는 직업이 교사가 아니라 숨겨져 빠진다
assert.deepEqual(Object.keys(validateForm(items, getDefaultValues(items))), [
  '1',
  '2',
  '4',
  '7',
]);

// 전화번호 형식, 최대 선택 수, 고정 선택지 해제, 기타 문구 누락
assert.deepEqual(
  validateForm(items, {
    '1': '  ',
    '2': '0101234',
    '3': ['1', '3'],
    '4': ETC_KEY,
    '4__etc': ' ',
  }),
  {
    '1': '필수 항목을 입력해주세요',
    '2': '휴대폰 번호 형식이 올바르지 않습니다',
    '3': '고정된 선택지는 해제할 수 없습니다',
    '4': '기타 내용을 입력해주세요',
    '7': '이미지를 올려주세요',
  },
);
assert.equal(
  validateForm(items, { '3': ['2', '1', '3'] })['3'],
  '최대 2개까지 선택 가능합니다',
);

// 숨김 필드 제외, 빈값 생략, CHECKBOX false, 고정 선택지 포함, 기타 치환, 전화번호 숫자만
assert.deepEqual(
  toSubmitPayload(items, {
    '1': ' 홍길동 ',
    '2': '010-1234-5678',
    '3': [ETC_KEY],
    '3__etc': ' 유튜브 ',
    '4': 'PARENT',
    '5': '남은 입력',
    '6': false,
    '7': 'https://cdn/a.png',
  }),
  {
    '1': '홍길동',
    '2': '01012345678',
    '3': ['2', '유튜브'],
    '4': 'PARENT',
    '6': false,
    '7': 'https://cdn/a.png',
  },
);

// 조건이 맞으면 학교가 보이고, 부모가 숨겨지면 자식도 숨겨진다
const visibleSchool = toSubmitPayload(items, { '4': 'TEACHER', '5': '광주초' });
assert.equal(visibleSchool['5'], '광주초');
const nested: DynamicFormItem = {
  ...agree,
  id: 8,
  otherJson: {
    hasEtc: false,
    conditional: { parentIndex: 4, triggerValue: '광주초' },
  },
};
assert.equal(
  toSubmitPayload([...items, nested], { '4': 'PARENT', '5': '광주초' })['8'],
  undefined,
);

console.log('toSubmitPayload.check: ok');
