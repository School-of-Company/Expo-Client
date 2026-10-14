/** 서버 `otherJson.conditional`. `triggerValue`와 `triggerValues` 중 하나만 온다. */
export interface FieldConditional {
  parentIndex: number;
  triggerValue?: string;
  triggerValues?: string[];
}

export interface ConditionalField {
  id: number | string;
  otherJson?: { conditional?: FieldConditional | null } | null;
}

/** 문항 id(문자열) → 답변. 렌더러 폼 값을 그대로 넘긴다. */
export type FieldValues = Readonly<Record<string, unknown>>;

const matchesTrigger = (value: unknown, conditional: FieldConditional) => {
  const triggers =
    conditional.triggerValues ??
    (conditional.triggerValue === undefined ? [] : [conditional.triggerValue]);

  if (typeof value === 'string') return triggers.includes(value);
  if (Array.isArray(value)) return value.some((v) => triggers.includes(v));
  return false;
};

/**
 * `index` 문항이 보이는지 판정한다. 자기 조건이 맞고 부모도 보여야 보인다.
 * 부모가 없는 인덱스를 가리키거나 조건이 순환하면 숨긴다.
 */
export const isFieldVisible = (
  fields: readonly ConditionalField[],
  values: FieldValues,
  index: number,
): boolean => {
  const visited = new Set<number>();
  let current = index;

  while (fields[current]) {
    const conditional = fields[current].otherJson?.conditional;
    if (!conditional) return true;
    if (visited.has(current)) return false;
    visited.add(current);

    const { parentIndex } = conditional;
    const parent = fields[parentIndex];
    if (!parent) return false;
    if (!matchesTrigger(values[String(parent.id)], conditional)) return false;
    current = parentIndex;
  }

  return false;
};
