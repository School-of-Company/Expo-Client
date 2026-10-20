import { isFieldVisible } from '@/shared/lib/form-conditional';
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
  const answers: SurveyAnswers = {};
  items.forEach((item, index) => {
    // 숨겨진 부모의 옛 값이 폼 상태에 남아 있어도(연쇄 조건) 부모가 숨으면 자식도 뺀다
    if (!isFieldVisible(items, data, index)) return;
    const value = data[String(item.id)];
    if (item.formType === 'CHECKBOX') {
      answers[item.id] = value === true;
    } else if (isFilled(value)) {
      answers[item.id] = value as string | string[];
    }
  });
  return answers;
};
