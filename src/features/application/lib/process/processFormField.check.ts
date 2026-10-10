/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/lib/process/processFormField.check.ts`
 */
import assert from 'node:assert/strict';
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

console.log('processFormField.check: ok');
