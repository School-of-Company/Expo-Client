/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/form/renderer/lib/visibilityEngine.check.ts`
 */
import assert from 'node:assert/strict';
import { getVisibleFieldIds } from './visibilityEngine';
import type { FormLogic } from '@/features/form/common/model/formSchema';

const when = (fieldId: string, value: string): FormLogic => ({
  visibility: { op: 'AND', conditions: [{ fieldId, op: 'eq', value }] },
});
const items = [
  { id: '1' },
  { id: '2', logic: when('1', '1') },
  { id: '3', logic: when('2', '1') },
  { id: '4', logic: when('3', 'x') },
];
const visible = (values: Record<string, string>) =>
  Array.from(getVisibleFieldIds(items, values)).sort();

// Q1 을 바꿔 Q2 가 숨으면 Q2 의 옛 값이 남아 있어도 Q3·Q4 도 숨는다(#727)
assert.deepEqual(visible({ 1: '2', 2: '1', 3: 'x' }), ['1']);
assert.deepEqual(visible({ 1: '1', 2: '1', 3: 'x' }), ['1', '2', '3', '4']);
assert.deepEqual(visible({ 1: '1', 2: '2', 3: 'x' }), ['1', '2']);

// 다중 선택 부모(OR contains)
const multi = [
  { id: '1' },
  {
    id: '2',
    logic: {
      visibility: {
        op: 'OR',
        conditions: [
          { fieldId: '1', op: 'contains', value: 'A' },
          { fieldId: '1', op: 'contains', value: 'B' },
        ],
      },
    } as FormLogic,
  },
  { id: '3', logic: when('2', 'y') },
];
assert.deepEqual(
  Array.from(getVisibleFieldIds(multi, { 1: ['B'], 2: 'y' } as never)).sort(),
  ['1', '2', '3'],
);
assert.deepEqual(
  Array.from(getVisibleFieldIds(multi, { 1: ['C'], 2: 'y' } as never)).sort(),
  ['1'],
);

// 목록에 없는 부모는 자기 조건만 본다
assert.deepEqual(
  Array.from(
    getVisibleFieldIds([{ id: '5', logic: when('9', 'y') }], { 9: 'y' }),
  ),
  ['5'],
);

// 순환은 숨긴다
assert.deepEqual(
  Array.from(
    getVisibleFieldIds(
      [
        { id: 'a', logic: when('b', 'y') },
        { id: 'b', logic: when('a', 'y') },
      ],
      { a: 'y', b: 'y' },
    ),
  ),
  [],
);

console.log('visibilityEngine.check: ok');
