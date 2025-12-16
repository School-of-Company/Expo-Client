import { FormLogic } from '@/features/form/common/model/formSchema';

export type FormValues = {
  [fieldId: string]: string | string[] | boolean | undefined;
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
        return fieldValue.includes(targetValue as string);
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
