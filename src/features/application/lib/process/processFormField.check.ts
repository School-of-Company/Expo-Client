/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/lib/process/processFormField.check.ts`
 */
import assert from 'node:assert/strict';
import { OCCUPATION_OPTIONS } from '@/entities/form/constants/occupationData';
import { processDynamicFormData } from './processDynamicFormData';
import type { DynamicFormItem } from '@/shared/types/application/type';

const region: DynamicFormItem = {
  id: 4,
  title: '지역',
  formType: 'REGION',
  jsonData: {},
  requiredStatus: true,
  otherJson: null,
};

const companion: DynamicFormItem = {
  id: 5,
  title: '동행자',
  formType: 'COMPANION',
  jsonData: {},
  requiredStatus: false,
  otherJson: { hasEtc: false, maxSelection: 4 },
};

const result = processDynamicFormData(
  {
    '4': 'GWANGJU',
    '5': [
      {
        name: ' 홍길동 ',
        occupation: 'TEACHER',
        region: 'JEONNAM',
        school: ' 광주초 ',
      },
      // 구분을 바꾸기 전에 입력한 소속은 보내지 않는다
      {
        name: '김일반',
        occupation: 'GENERAL',
        region: 'OTHER',
        school: '남은 값',
      },
    ],
  },
  [region, companion],
);

assert.deepEqual(result, {
  지역: 'GWANGJU',
  동행자: [
    {
      name: '홍길동',
      occupation: 'TEACHER',
      region: 'JEONNAM',
      school: '광주초',
    },
    { name: '김일반', occupation: 'GENERAL', region: 'OTHER' },
  ],
});

// 동행자를 추가하지 않으면 빈 목록
assert.deepEqual(processDynamicFormData({}, [companion]), { 동행자: [] });

const occupation: DynamicFormItem = {
  id: 6,
  title: '직업',
  formType: 'DROPDOWN',
  jsonData: Object.fromEntries(
    OCCUPATION_OPTIONS.map(({ key, label }) => [key, label]),
  ),
  requiredStatus: true,
  otherJson: null,
  dynamicFormType: 'OCCUPATION',
};

const school: DynamicFormItem = {
  id: 7,
  title: '소속 학교',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: false,
  otherJson: null,
  dynamicFormType: 'SCHOOL',
};

const motive: DynamicFormItem = {
  id: 8,
  title: '참여 동기',
  formType: 'DROPDOWN',
  jsonData: { '1': '홍보물', '2': 'sns' },
  requiredStatus: false,
  otherJson: null,
};

const memo: DynamicFormItem = {
  id: 9,
  title: '메모',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: false,
  otherJson: null,
};

// 직업은 9개 모두 표시 문구가 아니라 Occupation 키로 간다
OCCUPATION_OPTIONS.forEach(({ key }) => {
  assert.equal(processDynamicFormData({ '6': key }, [occupation]).직업, key);
});

// 교사·예비교사는 소속 학교를 입력한 그대로(앞뒤 공백만 걷고) 보낸다
assert.deepEqual(
  processDynamicFormData({ '6': 'TEACHER', '7': ' gsm 광주소마고 ' }, [
    occupation,
    school,
  ]),
  { 직업: 'TEACHER', '소속 학교': 'gsm 광주소마고' },
);
assert.deepEqual(
  processDynamicFormData({ '6': 'PRE_SERVICE_TEACHER', '7': '광주교대' }, [
    occupation,
    school,
  ]),
  { 직업: 'PRE_SERVICE_TEACHER', '소속 학교': '광주교대' },
);
// 교사에서 일반인으로 바꿔 숨겨진 소속 학교 값은 보내지 않는다
assert.deepEqual(
  processDynamicFormData({ '6': 'GENERAL', '7': '남은 값' }, [
    occupation,
    school,
  ]),
  { 직업: 'GENERAL', '소속 학교': '' },
);
// 직업 문항이 없는 연수자 폼은 소속 학교를 그대로 보낸다
assert.deepEqual(processDynamicFormData({ '7': '광주초' }, [school]), {
  '소속 학교': '광주초',
});

// 지역·일반 문항은 기존 계약 그대로: 지역은 키, 일반 선택은 대문자 보기 문구, 미입력은 빈 문자열
assert.deepEqual(
  processDynamicFormData({ '4': 'JEONNAM', '8': '2', '9': 'hello' }, [
    region,
    motive,
    memo,
    occupation,
  ]),
  { 지역: 'JEONNAM', '참여 동기': 'SNS', 메모: 'HELLO', 직업: '' },
);

console.log('processFormField.check: ok');
