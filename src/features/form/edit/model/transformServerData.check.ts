/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/form/edit/model/transformServerData.check.ts`
 * 다른 문항만 고쳐 저장해도 지역·동행자의 타입·필수 여부·최대 인원이 그대로 나가는지 본다.
 */
import assert from 'node:assert/strict';
import { transformFormData } from '@/features/form/common/model/formUtils';
import { transformServerData } from './transformServerData';
import type { DynamicFormItem } from '@/shared/types/application/type';
import type { ApplicationFormRequest } from '@/shared/types/form/create/type';

const item = (
  id: number,
  patch: Partial<DynamicFormItem>,
): DynamicFormItem => ({
  id,
  title: '',
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: false,
  otherJson: null,
  dynamicFormType: 'DEFAULT',
  ...patch,
});

const dynamicForm = [
  item(1, { title: '이름', requiredStatus: true }),
  item(2, { title: '지역', formType: 'REGION', requiredStatus: true }),
  item(3, {
    title: '동행자',
    formType: 'COMPANION',
    otherJson: { hasEtc: false, maxSelection: 3 },
  }),
];

const values = transformServerData(
  { title: '폼', informationText: '', dynamicForm },
  'application',
);
values.questions[0].title = '성함'; // 다른 문항만 수정

const request = transformFormData(
  values,
  'STANDARD',
  'application',
  'PRE',
  '',
  '',
) as ApplicationFormRequest;
const sent = request.dynamicForm;

assert.equal(sent[0].title, '성함');
assert.equal(sent[1].formType, 'REGION');
assert.equal(sent[1].requiredStatus, true);
assert.deepEqual(sent[1].jsonData, {});
assert.equal(sent[2].formType, 'COMPANION');
assert.equal(sent[2].otherJson?.maxSelection, 3);
console.log('transformServerData ok');
