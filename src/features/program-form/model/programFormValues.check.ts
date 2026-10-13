/**
 * 자체 점검: `node --experimental-strip-types src/features/program-form/model/programFormValues.check.ts`
 */
import assert from 'node:assert/strict';
import {
  toProgramFormRequest,
  toProgramFormValues,
} from './programFormValues.ts';
import type { ProgramForm } from '@/shared/types/form/program/type';

const form: ProgramForm = {
  id: 'form-1',
  expoId: 'expo-1',
  title: ' 제목 ',
  informationText: '',
  participantType: null,
  // 종료가 23:59:59.999 처럼 분 아래 값을 가진 폼
  startDate: '2026-11-01T00:00:00.000Z',
  endDate: '2026-11-30T14:59:59.999Z',
  dynamicForm: [
    {
      id: 7,
      title: '반',
      formType: 'DROPDOWN',
      jsonData: { '1': '1반' },
      requiredStatus: true,
      otherJson: null,
      dynamicFormType: 'DEFAULT',
    },
  ],
  purpose: 'PROGRAM',
  version: 3,
};

const values = toProgramFormValues(form);

// 손대지 않은 기간은 원래 값 그대로 — 분 단위로 잘리면 서버가 기간 축소로 거절한다
const untouched = toProgramFormRequest(values, form);
assert.equal(untouched.startDate, form.startDate);
assert.equal(untouched.endDate, form.endDate);

// 바꾼 기간은 입력값으로 보낸다
const moved = toProgramFormRequest(
  { ...values, endDate: '2026-12-31T18:00' },
  form,
);
assert.equal(moved.endDate, new Date('2026-12-31T18:00').toISOString());

// 필드는 id 를 떼고 DEFAULT, 대상 없음은 null, 제목은 trim
assert.deepEqual(untouched.dynamicForm, [
  {
    title: '반',
    formType: 'DROPDOWN',
    jsonData: { '1': '1반' },
    requiredStatus: true,
    otherJson: null,
    dynamicFormType: 'DEFAULT',
  },
]);
assert.equal(untouched.participantType, null);
assert.equal(untouched.title, '제목');

console.log('programFormValues.check: ok');
