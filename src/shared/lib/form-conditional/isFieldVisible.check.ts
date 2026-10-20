/**
 * 자체 점검: `node --experimental-strip-types src/shared/lib/form-conditional/isFieldVisible.check.ts`
 */
import assert from 'node:assert/strict';
import { isFieldVisible } from './isFieldVisible.ts';
import type { ConditionalField, FieldConditional } from './isFieldVisible.ts';

type TestField = Omit<ConditionalField, 'id'>;

// 문항 id를 순서(0부터)로 매겨, 답변을 배열 위치로 적을 수 있게 한다.
const visible = (
  fields: TestField[],
  values: unknown[] | Record<number, unknown>,
  index: number,
) =>
  isFieldVisible(
    fields.map((field, i) => ({ ...field, id: i })),
    { ...values },
    index,
  );

const plain: TestField = { otherJson: null };
const when = (conditional: FieldConditional): TestField => ({
  otherJson: { conditional },
});

// 조건 없는 문항은 항상 보인다.
assert.equal(visible([plain], [], 0), true);
assert.equal(visible([{ otherJson: { conditional: null } }], [], 0), true);
assert.equal(visible([{}], [], 0), true);

// 단일 triggerValue
{
  const fields = [plain, when({ parentIndex: 0, triggerValue: 'TEACHER' })];
  assert.equal(visible(fields, ['TEACHER'], 1), true);
  assert.equal(visible(fields, ['PARENT'], 1), false);
  assert.equal(visible(fields, [], 1), false);
  assert.equal(visible(fields, [''], 1), false);
}

// 다중 triggerValues
{
  const fields = [plain, when({ parentIndex: 0, triggerValues: ['A', 'B'] })];
  assert.equal(visible(fields, ['A'], 1), true);
  assert.equal(visible(fields, ['B'], 1), true);
  assert.equal(visible(fields, ['C'], 1), false);
}

// 빈 triggerValues, trigger 없음은 숨긴다.
assert.equal(
  visible([plain, when({ parentIndex: 0, triggerValues: [] })], ['A'], 1),
  false,
);
assert.equal(visible([plain, when({ parentIndex: 0 })], ['A'], 1), false);

// 부모 값이 배열(다중 선택)이면 하나라도 겹치면 보인다.
{
  const fields = [plain, when({ parentIndex: 0, triggerValues: ['A', 'B'] })];
  assert.equal(visible(fields, [['C', 'B']], 1), true);
  assert.equal(visible(fields, [['C', 'D']], 1), false);
  assert.equal(visible(fields, [[]], 1), false);
  const single = [plain, when({ parentIndex: 0, triggerValue: 'A' })];
  assert.equal(visible(single, [['A']], 1), true);
}

// 문자열·배열이 아닌 값(boolean, 객체 등)은 맞지 않는다.
{
  const fields = [plain, when({ parentIndex: 0, triggerValue: 'true' })];
  assert.equal(visible(fields, [true], 1), false);
  assert.equal(visible(fields, [{ value: 'true' }], 1), false);
}

// 부모가 숨겨지면 자식도 숨는다 (3단 체인).
{
  const fields = [
    plain,
    when({ parentIndex: 0, triggerValue: 'Y' }),
    when({ parentIndex: 1, triggerValue: 'Y' }),
    when({ parentIndex: 2, triggerValue: 'Y' }),
  ];
  assert.equal(visible(fields, ['Y', 'Y', 'Y'], 3), true);
  // 할아버지 조건이 깨지면 자식 값이 맞아도 숨는다.
  assert.equal(visible(fields, ['N', 'Y', 'Y'], 2), false);
  assert.equal(visible(fields, ['N', 'Y', 'Y'], 3), false);
  assert.equal(visible(fields, ['Y', 'N', 'Y'], 3), false);
  // 1번은 0번 답만 본다. 자기 답(N)은 노출과 무관하다.
  assert.equal(visible(fields, ['Y', 'N', 'Y'], 1), true);
  assert.equal(visible(fields, ['Y', 'N', 'Y'], 2), false);
  assert.equal(visible(fields, ['Y', 'N', 'Y'], 0), true);
}

// 부모가 뒤에 있어도 인덱스로만 찾는다.
{
  const fields = [when({ parentIndex: 1, triggerValue: 'Y' }), plain];
  assert.equal(visible(fields, { 1: 'Y' }, 0), true);
}

// 객체 values도 받는다.
{
  const fields = [plain, when({ parentIndex: 0, triggerValue: 'Y' })];
  assert.equal(visible(fields, { 0: 'Y' }, 1), true);
}

// 순환: 자기 참조, 직접(a↔b), 간접(a→b→c→a). 값이 다 맞아도 숨기고 멈춘다.
{
  const self = [when({ parentIndex: 0, triggerValue: 'Y' })];
  assert.equal(visible(self, ['Y'], 0), false);

  const pair = [
    when({ parentIndex: 1, triggerValue: 'Y' }),
    when({ parentIndex: 0, triggerValue: 'Y' }),
  ];
  assert.equal(visible(pair, ['Y', 'Y'], 0), false);
  assert.equal(visible(pair, ['Y', 'Y'], 1), false);

  const triangle = [
    when({ parentIndex: 2, triggerValue: 'Y' }),
    when({ parentIndex: 0, triggerValue: 'Y' }),
    when({ parentIndex: 1, triggerValue: 'Y' }),
    // 순환에 매달린 문항도 숨는다.
    when({ parentIndex: 0, triggerValue: 'Y' }),
  ];
  for (const i of [0, 1, 2, 3]) {
    assert.equal(visible(triangle, ['Y', 'Y', 'Y', 'Y'], i), false);
  }
}

// 범위 밖: 없는 부모는 Form 서버처럼 보이는 것으로 본다. 없는 문항은 숨긴다.
{
  const fields = [
    plain,
    when({ parentIndex: 5, triggerValue: 'Y' }),
    when({ parentIndex: -1, triggerValue: 'Y' }),
    when({ parentIndex: 1, triggerValue: 'Y' }),
  ];
  assert.equal(visible(fields, {}, 1), true);
  assert.equal(visible(fields, {}, 2), true);
  // 없는 부모에 매달린 문항은 자기 조건만 본다
  assert.equal(visible(fields, { 1: 'Y' }, 3), true);
  assert.equal(visible(fields, { 1: 'N' }, 3), false);
  assert.equal(visible(fields, [], 9), false);
  assert.equal(visible([], [], 0), false);
}

// 답변은 순서가 아니라 부모 문항 id로 찾는다.
{
  const fields: ConditionalField[] = [
    { id: 101, otherJson: null },
    {
      id: 202,
      otherJson: { conditional: { parentIndex: 0, triggerValue: 'Y' } },
    },
  ];
  assert.equal(isFieldVisible(fields, { '101': 'Y' }, 1), true);
  assert.equal(isFieldVisible(fields, { '0': 'Y' }, 1), false);
}

console.log('isFieldVisible ok');
