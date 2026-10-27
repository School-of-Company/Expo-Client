/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/lib/process/buildFirstFieldVisit.check.ts`
 */
import assert from 'node:assert/strict';
import { buildFirstFieldVisit } from './buildFirstFieldVisit.ts';
import type { DynamicFormItem } from '@/shared/types/application/type';

const item = (
  id: number,
  title: string,
  formType: string,
  dynamicFormType?: string,
): DynamicFormItem =>
  ({
    id,
    title,
    formType,
    dynamicFormType,
    jsonData: {},
    requiredStatus: true,
    otherJson: null,
  }) as DynamicFormItem;

const items = [
  item(1, '이름', 'SENTENCE', 'NAME'),
  item(2, '직업', 'DROPDOWN', 'OCCUPATION'),
  item(3, '소속', 'SENTENCE', 'SCHOOL'),
  item(4, '지역', 'REGION'),
  item(5, '동행자', 'COMPANION'),
];
let n = 0;
const ref = () => `ref-${n++}`;

const data = {
  '1': ' 김교사 ',
  '2': 'TEACHER',
  '3': ' 광주고 ',
  '4': 'GWANGJU',
  '5': [{ name: '아이', occupation: 'ELEMENTARY', region: 'GWANGJU' }],
};

const result = buildFirstFieldVisit(data as never, items, ref);
assert.ok('newParticipants' in result);
const [rep, kid] = result.newParticipants;
assert.equal(rep.name, '김교사');
assert.equal(rep.occupation, 'TEACHER');
assert.equal(rep.school, '광주고');
assert.equal(rep.region, 'GWANGJU');
assert.equal(kid.name, '아이');
assert.notEqual(rep.clientReference, kid.clientReference);
assert.ok(!('phoneNumber' in rep));
const info = JSON.parse(rep.informationJson ?? '{}');
assert.ok(!('이름' in info) && !('동행자' in info));
assert.equal(info['직업'], 'TEACHER');

const missingSchool = buildFirstFieldVisit(
  { ...data, '3': '' } as never,
  items,
  ref,
);
assert.ok('error' in missingSchool);
assert.ok(
  'error' in buildFirstFieldVisit({ ...data, '1': '' } as never, items, ref),
);

// 같은 references 를 넘기면 재시도에서도 같은 참조값이다
const refs: string[] = [];
const a = buildFirstFieldVisit(data as never, items, ref, refs) as {
  newParticipants: { clientReference: string }[];
};
const b = buildFirstFieldVisit(data as never, items, ref, refs) as typeof a;
assert.deepEqual(a.newParticipants, b.newParticipants);
console.log('buildFirstFieldVisit ok');
