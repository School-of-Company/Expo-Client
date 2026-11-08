/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/form/common/model/systemQuestions.check.ts`
 */
import assert from 'node:assert/strict';
import { transformFormData } from './formUtils';
import {
  buildMissingSystemQuestions,
  createSystemQuestions,
  findMissingSystemFields,
  isSystemQuestionType,
  requiresSystemFields,
} from './systemQuestions';
import type { FormValues } from '@/shared/types/form/create/type';

// 일반 참가자 신청 폼만 강제한다
assert.equal(requiresSystemFields('STANDARD', 'application'), true);
assert.equal(requiresSystemFields('TRAINEE', 'application'), false);
assert.equal(requiresSystemFields('STANDARD', 'survey'), false);

// 새 폼 기본 문항: 이름·전화번호·직업·조건부 소속 학교, 모두 필수
const created = createSystemQuestions();
assert.deepEqual(
  created.map((q) => [
    q.dynamicFormType,
    q.title,
    q.formType,
    q.requiredStatus,
  ]),
  [
    ['NAME', '이름', 'SENTENCE', true],
    ['PHONE_NUMBER', '전화번호', 'SENTENCE', true],
    ['OCCUPATION', '직업', 'DROPDOWN', true],
    ['SCHOOL', '소속 학교', 'SENTENCE', true],
  ],
);
assert.ok(created.every((q) => isSystemQuestionType(q.dynamicFormType)));
assert.equal(isSystemQuestionType('DEFAULT'), false);
assert.equal(isSystemQuestionType('TRAINING_ID'), false);

// 소속 학교는 직업의 교사·예비교사 선택지에 조건이 걸린다
const occupation = created[2];
const school = created[3];
const teacherIds = occupation.options
  .filter((o) => o.key === 'TEACHER' || o.key === 'PRE_SERVICE_TEACHER')
  .map((o) => o.id);
assert.equal(teacherIds.length, 2);
assert.deepEqual(JSON.parse(school.otherJson!).conditional, {
  parentId: occupation.id,
  triggerValues: teacherIds,
});

// 서버 모양: 직업 키 고정, 소속 학교는 직업 위치(parentIndex) + 교사·예비교사 키로 바뀐다
const values: FormValues = {
  title: '참가자 신청',
  informationText: '개인정보를 이렇게 씁니다.',
  questions: created,
};
const server = transformFormData(
  values,
  'STANDARD',
  'application',
  'PRE',
  '2026-01-01',
  '2026-01-31',
) as {
  dynamicForm: { jsonData: Record<string, string>; otherJson: unknown }[];
};
assert.deepEqual(Object.keys(server.dynamicForm[2].jsonData).sort(), [
  'ELEMENTARY_STUDENT',
  'GENERAL',
  'HIGH_SCHOOL_STUDENT',
  'KINDERGARTEN_STUDENT',
  'MIDDLE_SCHOOL_STUDENT',
  'PARENT',
  'PRE_SERVICE_TEACHER',
  'TEACHER',
]);
const conditional = (
  server.dynamicForm[3].otherJson as {
    conditional: { parentIndex: number; triggerValues: string[] };
  }
).conditional;
assert.equal(conditional.parentIndex, 2);
assert.deepEqual(conditional.triggerValues.sort(), [
  'PRE_SERVICE_TEACHER',
  'TEACHER',
]);

// 다 있으면 빠진 항목 없음
assert.deepEqual(findMissingSystemFields(values), []);

// 빠진 항목은 화면 순서대로. 공백뿐인 안내문도 빠진 것으로 본다
const custom = {
  id: 'q1',
  title: '관심 분야',
  formType: 'SENTENCE',
  options: [],
  requiredStatus: false,
  otherJson: null,
  dynamicFormType: 'DEFAULT' as const,
};
assert.deepEqual(
  findMissingSystemFields({ questions: [custom], informationText: '  ' }),
  ['NAME', 'PHONE_NUMBER', 'OCCUPATION', 'SCHOOL', 'INFORMATION_TEXT'],
);
assert.deepEqual(
  findMissingSystemFields({
    questions: [created[0], created[1], created[2]],
    informationText: '안내',
  }),
  ['SCHOOL'],
);

// 이미 있는 직업 문항에는 새 직업을 만들지 않고 소속 학교 조건을 그 문항에 건다
const added = buildMissingSystemQuestions([custom, created[0], occupation]);
assert.deepEqual(
  added.map((q) => q.dynamicFormType),
  ['PHONE_NUMBER', 'SCHOOL'],
);
assert.equal(
  JSON.parse(added[1].otherJson!).conditional.parentId,
  occupation.id,
);
// 모두 있으면 아무것도 만들지 않는다
assert.deepEqual(buildMissingSystemQuestions(created), []);

console.log('systemQuestions.check: ok');
