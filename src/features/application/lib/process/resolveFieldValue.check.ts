/**
 * 자체 점검: `node --experimental-strip-types src/features/application/lib/process/resolveFieldValue.check.ts`
 */
import assert from 'node:assert/strict';
import { buildSurveyAnswers } from './buildSurveyAnswers.ts';
import { resolveFieldValue } from './resolveFieldValue.ts';
import type { DynamicFormItem } from '@/shared/types/application/type';

const multiple: DynamicFormItem = {
  id: 12,
  title: '참여 동기',
  formType: 'MULTIPLE',
  jsonData: {
    '1': '홍보물',
    '2': { value: '지인 추천', isAlwaysSelected: true },
  },
  requiredStatus: true,
  otherJson: { hasEtc: false, maxSelection: 2 },
};

const occupation: DynamicFormItem = {
  id: 13,
  title: '직업',
  formType: 'DROPDOWN',
  jsonData: { TEACHER: '교사', PARENT: '학부모' },
  requiredStatus: true,
  otherJson: null,
};

const school: DynamicFormItem = {
  id: 14,
  title: '소속 학교',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: false,
  otherJson: {
    hasEtc: false,
    conditional: { parentIndex: 1, triggerValues: ['TEACHER'] },
  },
};

const agree: DynamicFormItem = {
  id: 15,
  title: '수신 동의',
  formType: 'CHECKBOX',
  jsonData: {},
  requiredStatus: false,
  otherJson: null,
};

const items = [multiple, occupation, school, agree];

// 선택지 키는 보기 문구로 복원된다
assert.deepEqual(resolveFieldValue({ '12': ['1', '2'] }, multiple), [
  '홍보물',
  '지인 추천',
]);
assert.equal(resolveFieldValue({ '13': 'TEACHER' }, occupation), '교사');
// 선택지가 없는 질문은 입력값을 그대로, 프로토타입 키에 속지 않는다
assert.equal(resolveFieldValue({ '14': 'constructor' }, school), 'constructor');
assert.equal(resolveFieldValue({}, school), undefined);

// 답변은 문항 id 키, 선택지는 키 그대로
assert.deepEqual(
  buildSurveyAnswers(
    {
      '12': ['1'],
      '13': 'TEACHER',
      '14': '광주소프트웨어마이스터고',
      '15': true,
    },
    items,
  ),
  {
    '12': ['1'],
    '13': 'TEACHER',
    '14': '광주소프트웨어마이스터고',
    '15': true,
  },
);

// 조건이 안 맞아 숨겨진 문항, 빈 값은 빠지고 체크박스는 false로 간다
assert.deepEqual(
  buildSurveyAnswers({ '12': [], '13': 'PARENT', '14': '남은 입력' }, items),
  { '13': 'PARENT', '15': false },
);

console.log('survey answer checks passed');
