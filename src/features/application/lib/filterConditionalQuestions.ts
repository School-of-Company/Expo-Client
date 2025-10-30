import { DynamicFormItem } from '@/shared/types/application/type';
import { ConditionalSettings } from '@/shared/types/form/create/type';

const parseOtherJson = (otherJson: string | null): ConditionalSettings => {
  if (!otherJson) return { hasEtc: false };

  try {
    const parsed = JSON.parse(otherJson);
    return {
      hasEtc: parsed.hasEtc || false,
      conditional: parsed.conditional,
    };
  } catch {
    return { hasEtc: otherJson === 'etc' };
  }
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const filterConditionalQuestions = (
  questions: DynamicFormItem[],
  formValues: Record<string, string | string[]>,
): DynamicFormItem[] => {
  return questions.filter((question) => {
    const settings = parseOtherJson(question.otherJson);

    if (!settings.conditional) return true;

    const { parentIndex, triggerValue } = settings.conditional;

    const parentQuestion = questions[parentIndex];
    if (!parentQuestion) {
      console.warn(`Parent question at index ${parentIndex} not found`);
      return false;
    }

    const parentValue = formValues[slugify(parentQuestion.title)];

    if (!parentValue) return false;

    if (Array.isArray(parentValue)) {
      return parentValue.includes(triggerValue);
    }

    return parentValue === triggerValue;
  });
};
