/**
 * 자체 점검: `node --experimental-strip-types src/features/form/common/model/formUtils.check.ts`
 */
import assert from 'node:assert/strict';
import { transformServerData } from '../../edit/model/transformServerData.ts';
import { transformFormData } from './formUtils.ts';
import type { ApplicationFormRequest } from '@/shared/types/form/create/type';

const occupation = {
  id: 'q-occ',
  title: '직업',
  formType: 'DROPDOWN',
  requiredStatus: true,
  dynamicFormType: 'OCCUPATION' as const,
  otherJson: null,
  options: [
    { id: 'o-parent', key: 'PARENT', value: '학부모' },
    { id: 'o-teacher', key: 'TEACHER', value: '교사' },
  ],
};

const form = {
  title: '사전 신청',
  informationText: '',
  questions: [
    { ...occupation, id: 'q-consent', formType: 'PRIVACYCONSENT', options: [] },
    occupation,
    {
      id: 'q-school',
      title: '소속 학교',
      formType: 'SENTENCE',
      requiredStatus: false,
      dynamicFormType: 'SCHOOL' as const,
      options: [],
      otherJson: JSON.stringify({
        conditional: { parentId: 'q-occ', triggerValues: ['o-teacher'] },
      }),
    },
    {
      id: 'q-motive',
      title: '참여 동기',
      formType: 'MULTIPLE',
      requiredStatus: false,
      options: [
        { id: 'm-1', value: '홍보물' },
        { id: 'm-2', value: '지인 추천', isAlwaysSelected: true },
      ],
      otherJson: JSON.stringify({
        maxSelection: 2,
        conditional: { parentId: 'q-occ', triggerValue: 'o-parent' },
      }),
    },
  ],
};

const request = transformFormData(
  form,
  'STANDARD',
  'application',
  'PRE',
  '2026-10-10T00:00:00.000Z',
  '2026-10-11T00:00:00.000Z',
) as ApplicationFormRequest;

// 개인정보 동의는 빠지고, 조건은 남은 목록 안의 위치(0부터)와 선택지 키로 간다
assert.deepEqual(
  request.dynamicForm.map((f) => [f.jsonData, f.otherJson]),
  [
    [{ PARENT: '학부모', TEACHER: '교사' }, null],
    [
      {},
      {
        hasEtc: false,
        conditional: { parentIndex: 0, triggerValues: ['TEACHER'] },
      },
    ],
    [
      { '1': '홍보물', '2': { value: '지인 추천', isAlwaysSelected: true } },
      {
        hasEtc: false,
        maxSelection: 2,
        conditional: { parentIndex: 0, triggerValue: 'PARENT' },
      },
    ],
  ],
);

// 서버 응답을 다시 빌더로 읽고 저장하면 같은 요청이 된다. 기존 필드는 서버 id 를 함께 보낸다(#967)
const response = {
  ...request,
  dynamicForm: request.dynamicForm.map((f, index) => ({ ...f, id: index + 1 })),
};
const reloaded = transformServerData(response, 'application');
assert.equal(reloaded.questions[2].options[0].key, undefined);
assert.deepEqual(
  transformFormData(
    reloaded,
    'STANDARD',
    'application',
    'PRE',
    request.startDate,
    request.endDate,
  ),
  {
    ...request,
    dynamicForm: request.dynamicForm.map((f, index) => ({
      id: index + 1,
      ...f,
    })),
  },
);

// 새로 추가한 문항(서버 id 없음)은 id 를 싣지 않는다
reloaded.questions.push({
  title: '새 문항',
  formType: 'SENTENCE',
  options: [],
  requiredStatus: false,
  otherJson: null,
});
const withNew = transformFormData(
  reloaded,
  'STANDARD',
  'application',
  'PRE',
  request.startDate,
  request.endDate,
) as ApplicationFormRequest;
assert.equal(
  'id' in withNew.dynamicForm[withNew.dynamicForm.length - 1],
  false,
);

// 설문 수정 요청에는 id 를 싣지 않는다(이번 범위는 등록 폼)
const survey = transformFormData(reloaded, 'STANDARD', 'survey', 'PRE', '', '');
assert.equal(
  'dynamicSurveyRequestDto' in survey &&
    survey.dynamicSurveyRequestDto.some((f) => 'id' in f),
  false,
);

console.log('formUtils checks passed');
