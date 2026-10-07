import type {
  DynamicFormItem,
  DynamicFormValues,
  SurveyAnswers,
} from '@/shared/types/application/type';

const isFilled = (value: unknown) =>
  Array.isArray(value)
    ? value.length > 0
    : typeof value === 'string' && value !== '';

/**
 * 렌더러 값을 Form 서비스 답변(`{ [문항 id]: 값 }`)으로 바꾼다. 서버가 모르는 키를 거부하고(strict)
 * 빈 문자열·빈 배열도 받지 않아서, 숨겨진 문항과 비어 있는 답변은 뺀다.
 */
export const buildSurveyAnswers = (
  data: DynamicFormValues,
  items: DynamicFormItem[],
): SurveyAnswers => {
  const isVisible = (item: DynamicFormItem) => {
    const conditional = item.otherJson?.conditional;
    const parent = conditional && items[conditional.parentIndex];
    if (!parent) return true;
    const triggers = conditional.triggerValues ?? [conditional.triggerValue];
    const parentValue = data[String(parent.id)];
    return Array.isArray(parentValue)
      ? parentValue.some((value) => triggers.includes(value))
      : triggers.includes(parentValue as string);
  };

  const answers: SurveyAnswers = {};
  for (const item of items) {
    if (!isVisible(item)) continue;
    const value = data[String(item.id)];
    if (item.formType === 'CHECKBOX') {
      answers[item.id] = value === true;
    } else if (isFilled(value)) {
      answers[item.id] = value as string | string[];
    }
  }
  return answers;
};
