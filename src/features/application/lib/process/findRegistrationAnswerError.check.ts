/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/lib/process/findRegistrationAnswerError.check.ts`
 */
import assert from 'node:assert/strict';
import { OCCUPATION_OPTIONS } from '@/entities/form/constants/occupationData';
import { findRegistrationAnswerError } from './findRegistrationAnswerError';
import type { DynamicFormItem } from '@/shared/types/application/type';

const occupation: DynamicFormItem = {
  id: 1,
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
  id: 2,
  title: '소속 학교',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: false,
  otherJson: null,
  dynamicFormType: 'SCHOOL',
};

const region: DynamicFormItem = {
  id: 3,
  title: '지역',
  formType: 'REGION',
  jsonData: {},
  requiredStatus: true,
  otherJson: null,
};

const items = [occupation, school, region];

// 9개 직업 키는 모두 통과한다(교사·예비교사는 소속 학교와 함께)
OCCUPATION_OPTIONS.forEach(({ key }) => {
  assert.equal(
    findRegistrationAnswerError(
      { '1': key, '2': '광주초', '3': 'OTHER' },
      items,
    ),
    undefined,
  );
});
// 비어 있으면 렌더러의 필수 검증에 맡긴다
assert.equal(findRegistrationAnswerError({}, items), undefined);

// 키가 아닌 값(보기 문구 등)은 서버가 거절하므로 다시 고르게 한다
assert.equal(
  findRegistrationAnswerError({ '1': '일반인' }, items),
  "'직업' 항목을 다시 선택해주세요.",
);
assert.equal(
  findRegistrationAnswerError({ '1': 'GENERAL', '3': '광주' }, items),
  "'지역' 항목을 다시 선택해주세요.",
);

// 교사·예비교사는 소속 학교가 필요하고 100자를 넘을 수 없다
assert.equal(
  findRegistrationAnswerError({ '1': 'TEACHER', '2': '  ' }, items),
  "교사·예비교사는 '소속 학교' 항목을 입력해야 합니다.",
);
assert.equal(
  findRegistrationAnswerError(
    { '1': 'PRE_SERVICE_TEACHER', '2': 'a'.repeat(101) },
    items,
  ),
  "'소속 학교' 항목은 100자 이하로 입력해주세요.",
);
// 다른 직업은 숨겨진 소속 학교 값을 따지지 않는다(제출에서 빠진다)
assert.equal(
  findRegistrationAnswerError({ '1': 'PARENT', '2': 'a'.repeat(101) }, items),
  undefined,
);
// 소속 학교 문항이 없는 신청서는 운영자 설정 문제로 안내한다
assert.match(
  findRegistrationAnswerError({ '1': 'TEACHER' }, [occupation]) ?? '',
  /운영자에게 문의/,
);

console.log('findRegistrationAnswerError.check: ok');
