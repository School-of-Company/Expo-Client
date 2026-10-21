import { FormLogic } from '@/features/form/common/model/formSchema';
import { Companion } from '@/shared/types/application/type';

export type FormValues = {
  [fieldId: string]: string | string[] | boolean | Companion[] | undefined;
};

type ConditionOperator = 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt' | 'contains';

interface Condition {
  fieldId: string;
  op: ConditionOperator;
  value: string | number | boolean | string[];
}

export function evaluateCondition(
  condition: Condition,
  formValues: FormValues,
): boolean {
  const fieldValue = formValues[condition.fieldId];
  const targetValue = condition.value;

  switch (condition.op) {
    case 'eq':
      return fieldValue === targetValue;

    case 'neq':
      return fieldValue !== targetValue;

    case 'in':
      if (Array.isArray(targetValue)) {
        return targetValue.includes(fieldValue as string);
      }
      return false;

    case 'nin':
      if (Array.isArray(targetValue)) {
        return !targetValue.includes(fieldValue as string);
      }
      return true;

    case 'gt':
      if (typeof fieldValue === 'number' && typeof targetValue === 'number') {
        return fieldValue > targetValue;
      }
      return false;

    case 'lt':
      if (typeof fieldValue === 'number' && typeof targetValue === 'number') {
        return fieldValue < targetValue;
      }
      return false;

    case 'contains':
      if (Array.isArray(fieldValue)) {
        return (fieldValue as string[]).includes(targetValue as string);
      }
      return fieldValue === targetValue;

    default:
      return false;
  }
}

export function evaluateVisibility(
  logic: FormLogic | undefined,
  formValues: FormValues,
): boolean {
  if (!logic?.visibility) {
    return true;
  }

  const { op, conditions } = logic.visibility;

  if (!conditions || conditions.length === 0) {
    return true;
  }

  if (op === 'AND') {
    return conditions.every((condition: Condition) =>
      evaluateCondition(condition, formValues),
    );
  }

  if (op === 'OR') {
    return conditions.some((condition: Condition) =>
      evaluateCondition(condition, formValues),
    );
  }

  return true;
}

/**
 * 문항마다 보이는지 판정한다. 자기 조건이 맞고 조건이 가리키는 부모 문항도 보여야 보인다(연쇄 조건 Q1→Q2→Q3).
 * 숨겨진 부모의 옛 값이 폼 상태에 남아 있어도 자식을 띄우지 않는다. 목록에 없는 부모는 자기 조건만 보고, 순환은 숨긴다
 */
export function getVisibleFieldIds(
  items: readonly { id: string; logic?: FormLogic }[],
  formValues: FormValues,
): Set<string> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const memo = new Map<string, boolean>();
  const visiting = new Set<string>();

  const isVisible = (id: string): boolean => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    const item = byId.get(id);
    if (!item) return true;
    if (visiting.has(id)) return false;
    visiting.add(id);
    const parents = (item.logic?.visibility?.conditions ?? []).map(
      (condition: Condition) => condition.fieldId,
    );
    const visible =
      evaluateVisibility(item.logic, formValues) &&
      parents.every((parentId) => isVisible(parentId));
    visiting.delete(id);
    memo.set(id, visible);
    return visible;
  };

  return new Set(
    items.filter((item) => isVisible(item.id)).map(({ id }) => id),
  );
}
