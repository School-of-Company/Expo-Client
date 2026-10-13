/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/form-builder/model/fieldOps.check.ts`
 */
import assert from 'node:assert/strict';
import { withOptionLabel } from '@/entities/form/model/formTypes';
import {
  addField,
  changeFormType,
  duplicateField,
  moveField,
  nextOptionKey,
  removeField,
  removeOption,
} from './fieldOps';
import { validateFields } from './validateFields';
import type {
  DynamicFormItem,
  OtherJson,
} from '@/shared/types/application/type';

const field = (
  id: number,
  conditional?: OtherJson['conditional'],
  formType: DynamicFormItem['formType'] = 'DROPDOWN',
): DynamicFormItem => ({
  id,
  title: `q${id}`,
  formType,
  jsonData: formType === 'SENTENCE' ? {} : { '1': 'A', '2': 'B', '3': 'C' },
  requiredStatus: false,
  otherJson: conditional ? { hasEtc: false, conditional } : null,
  dynamicFormType: 'DEFAULT',
});

const parentOf = (list: DynamicFormItem[], id: number) =>
  list.find((item) => item.id === id)?.otherJson?.conditional?.parentIndex;

// 0:A, 1:B(→A), 2:C, 3:D(→C)
const base = () => [
  field(1),
  field(2, { parentIndex: 0, triggerValue: '1' }),
  field(3),
  field(4, { parentIndex: 2, triggerValues: ['2', '3'] }),
];

// 이동: 부모를 따라가는 인덱스 보정
{
  // 맨 앞 부모(A)를 맨 뒤로: B는 A(3)를 보지만 A가 뒤라 경고
  const moved = moveField(base(), 0, 3);
  assert.deepEqual(
    moved.map((f) => f.id),
    [2, 3, 4, 1],
  );
  assert.equal(parentOf(moved, 2), 3);
  assert.equal(parentOf(moved, 4), 1);
  assert.deepEqual(validateFields(moved).get(0), [
    '부모 문항(4번)이 이 문항보다 뒤에 있습니다.',
  ]);
  assert.equal(validateFields(moved).has(2), false);

  // 자식(D)을 맨 앞으로: 부모 C는 3번이 됨
  const up = moveField(base(), 3, 0);
  assert.equal(parentOf(up, 4), 3);
  assert.equal(parentOf(up, 2), 1);
  assert.equal(validateFields(up).size, 1);

  // 조건과 무관한 이동은 그대로, 같은 자리 이동은 동일
  const swap = moveField(base(), 1, 2);
  assert.equal(parentOf(swap, 2), 0);
  assert.equal(parentOf(swap, 4), 1);
  assert.equal(validateFields(swap).size, 0);
  assert.deepEqual(moveField(base(), 2, 2), base());

  // 왕복하면 원래대로
  assert.deepEqual(moveField(moveField(base(), 0, 3), 3, 0), base());
}

// 삭제: 뒤 인덱스 -1, 부모가 지워진 자식은 조건 제거
{
  const removed = removeField(base(), 0);
  assert.deepEqual(
    removed.map((f) => f.id),
    [2, 3, 4],
  );
  assert.equal(removed[0].otherJson?.conditional, undefined);
  assert.equal(parentOf(removed, 4), 1);
  assert.equal(validateFields(removed).size, 0);

  // 중간(B) 삭제: D의 부모 C가 2→1
  const middle = removeField(base(), 1);
  assert.equal(parentOf(middle, 4), 1);

  // 자식 삭제는 다른 문항에 영향 없음
  const leaf = removeField(base(), 3);
  assert.equal(parentOf(leaf, 2), 0);
}

// 복제: 바로 아래 삽입, 새 id, 뒤 인덱스 +1
{
  const dup = duplicateField(base(), 0);
  assert.deepEqual(
    dup.map((f) => f.id),
    [1, -1, 2, 3, 4],
  );
  assert.equal(parentOf(dup, 2), 0);
  assert.equal(parentOf(dup, 4), 3);
  // 조건 있는 문항 복제는 같은 부모를 본다
  const dupChild = duplicateField(base(), 1);
  assert.equal(dupChild[2].otherJson?.conditional?.parentIndex, 0);
  assert.equal(dupChild[2].otherJson?.conditional?.triggerValue, '1');
  // 깊은 복사: 복제본 수정이 원본에 새지 않는다
  dupChild[2].jsonData['9'] = 'X';
  assert.equal('9' in dupChild[1].jsonData, false);
  // 임시 id는 계속 줄어든다
  assert.equal(duplicateField(dup, 0)[1].id, -2);
  assert.equal(addField(dup, 'SENTENCE').at(-1)?.id, -2);
}

// 옵션 삭제: 자식 trigger에서 키 제거, 비면 경고
{
  const single = removeOption(base(), 0, '1');
  assert.equal('1' in single[0].jsonData, false);
  assert.equal(single[1].otherJson?.conditional?.triggerValue, undefined);
  assert.deepEqual(validateFields(single).get(1), ['조건 값을 선택해주세요.']);

  const multi = removeOption(base(), 2, '2');
  assert.deepEqual(multi[3].otherJson?.conditional?.triggerValues, ['3']);
  assert.equal(validateFields(multi).size, 0);

  // 키는 다시 매기지 않는다
  assert.deepEqual(Object.keys(single[0].jsonData), ['2', '3']);
  assert.equal(nextOptionKey(single[0].jsonData), '4');
  assert.equal(nextOptionKey({}), '1');
}

// maxSelection: 선택지를 줄이면 같이 낮추고, 범위를 벗어난 값은 경고
{
  const multi = (maxSelection: number): DynamicFormItem => ({
    ...field(1, undefined, 'MULTIPLE'),
    title: 'q',
    otherJson: { hasEtc: false, maxSelection },
  });
  // 선택지 3개 → 2개: 3은 2로 낮춘다. 이미 작은 값은 그대로
  assert.equal(removeOption([multi(3)], 0, '1')[0].otherJson?.maxSelection, 2);
  assert.equal(removeOption([multi(2)], 0, '1')[0].otherJson?.maxSelection, 2);
  assert.equal(removeOption([multi(1)], 0, '1')[0].otherJson?.maxSelection, 1);
  for (const bad of [-1, 0, 1.5]) {
    assert.deepEqual(validateFields([multi(bad)]).get(0), [
      '최대 선택 개수는 1 이상의 정수여야 합니다.',
    ]);
  }
  assert.deepEqual(validateFields([multi(4)]).get(0), [
    '최대 선택 개수가 선택지 수보다 많습니다.',
  ]);
  assert.equal(validateFields([multi(3)]).size, 0);
}

// 타입 변경: 선택지 없는 타입이면 자식에 경고
{
  const changed = changeFormType(base(), 0, 'SENTENCE');
  assert.deepEqual(changed[0].jsonData, {});
  assert.deepEqual(validateFields(changed).get(1), [
    '부모 문항(1번)이 선택형이 아닙니다.',
  ]);
  // MULTIPLE → DROPDOWN: maxSelection 정리, 객체 선택지(isAlwaysSelected)는 보존
  const multiple: DynamicFormItem = {
    ...field(9, undefined, 'MULTIPLE'),
    jsonData: { '1': { value: 'A', isAlwaysSelected: true } },
    otherJson: { hasEtc: true, maxSelection: 2 },
  };
  const [dropdown] = changeFormType([multiple], 0, 'DROPDOWN');
  assert.deepEqual(dropdown.jsonData, {
    '1': { value: 'A', isAlwaysSelected: true },
  });
  assert.deepEqual(dropdown.otherJson, { hasEtc: true });
}

// 라벨만 고쳐도 isAlwaysSelected는 남는다
assert.deepEqual(
  withOptionLabel({ value: 'A', isAlwaysSelected: true }, 'AA'),
  { value: 'AA', isAlwaysSelected: true },
);
assert.equal(withOptionLabel('A', 'AA'), 'AA');

// 타입을 돌려도 옛 trigger가 새 선택지에 붙지 않는다
{
  const parentThenChild = () => [
    field(1),
    field(2, { parentIndex: 0, triggerValue: '1' }),
  ];
  const away = changeFormType(parentThenChild(), 0, 'SENTENCE');
  assert.equal(away[1].otherJson?.conditional?.triggerValue, undefined);
  const back = changeFormType(away, 0, 'DROPDOWN');
  assert.deepEqual(back[0].jsonData, { '1': '' });
  assert.equal(back[1].otherJson?.conditional?.triggerValue, undefined);
  assert.deepEqual(validateFields(back).get(1), ['조건 값을 선택해주세요.']);
  // 선택지가 그대로 남는 변경(드롭다운 → 객관식)은 조건을 유지한다
  const kept = changeFormType(parentThenChild(), 0, 'MULTIPLE');
  assert.equal(kept[1].otherJson?.conditional?.triggerValue, '1');
  assert.equal(validateFields(kept).has(1), false);
}

// 검증: 범위 밖 부모, 없는 선택지, 특수 필드 중복
{
  const broken = [
    field(1),
    field(2, { parentIndex: 7, triggerValue: '1' }),
    field(3, { parentIndex: 0, triggerValue: '9' }),
  ];
  const w = validateFields(broken);
  assert.deepEqual(w.get(1), ['조건의 부모 문항이 없습니다.']);
  assert.deepEqual(w.get(2), ['부모 문항에 없는 선택지가 조건에 있습니다.']);
  // 범위 밖 인덱스는 이동해도 건드리지 않는다
  assert.equal(parentOf(moveField(broken, 0, 2), 2), 7);

  const dupName = [
    { ...field(1), dynamicFormType: 'NAME' as const },
    { ...field(2), dynamicFormType: 'NAME' as const },
  ];
  assert.deepEqual(validateFields(dupName).get(1), [
    'NAME 문항이 이미 있습니다.',
  ]);
}

// 기본 입력 검사: 빈 제목, 빈 선택지
{
  const blank = addField([], 'DROPDOWN');
  assert.deepEqual(validateFields(blank).get(0), [
    '질문을 입력해주세요.',
    '비어 있는 선택지가 있습니다.',
  ]);
  assert.deepEqual(validateFields(addField([], 'SENTENCE')).get(0), [
    '질문을 입력해주세요.',
  ]);
}

console.log('fieldOps ok');
