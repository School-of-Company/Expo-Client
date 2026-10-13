import {
  etcKey,
  fieldRegistry,
  type FieldDefinition,
  type FieldValue,
} from '@/entities/form/registry';
import { isFieldVisible } from '@/shared/lib/form-conditional';
import type {
  DynamicFormItem,
  SurveyAnswers,
} from '@/shared/types/application/type';

export type FillValues = Record<string, FieldValue>;

/** 보이고 렌더러가 있는 문항만 `(문항, 정의, 값, 기타 문구)`로 돈다. 숨겨진 문항은 검증·제출에서 빠진다. */
const eachActiveField = (
  items: DynamicFormItem[],
  values: FillValues,
  fn: (
    item: DynamicFormItem,
    definition: FieldDefinition,
    value: FieldValue,
    etc: string,
  ) => void,
) => {
  for (const item of items) {
    const definition = fieldRegistry[item.formType];
    if (!definition || !isFieldVisible(item, items, values)) continue;
    const id = String(item.id);
    const etc = values[etcKey(id)];
    fn(item, definition, values[id], typeof etc === 'string' ? etc : '');
  }
};

export const getDefaultValues = (items: DynamicFormItem[]): FillValues =>
  Object.fromEntries(
    items.flatMap((item) => {
      const definition = fieldRegistry[item.formType];
      return definition
        ? [[String(item.id), definition.defaultValue(item)]]
        : [];
    }),
  );

/** 문항 id → 오류 문구. 비어 있으면 통과. */
export const validateForm = (items: DynamicFormItem[], values: FillValues) => {
  const errors: Record<string, string> = {};
  eachActiveField(items, values, (item, definition, value, etc) => {
    const message = definition.validate(item, value, etc);
    if (message) errors[String(item.id)] = message;
  });
  return errors;
};

/** 렌더러 값을 Form 서비스 답변(`{ [문항 id]: 값 }`)으로 바꾼다. 서버가 빈 값을 거부해 빈 답은 뺀다. */
export const toSubmitPayload = (
  items: DynamicFormItem[],
  values: FillValues,
): SurveyAnswers => {
  const answers: SurveyAnswers = {};
  eachActiveField(items, values, (item, definition, value, etc) => {
    const answer = definition.toAnswer(item, value, etc);
    if (answer !== undefined) answers[item.id] = answer;
  });
  return answers;
};
