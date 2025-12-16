import { ApplicationForm } from '@/shared/types/application/type';
import { FormValues, Option } from '@/shared/types/form/create/type';

interface JsonOption {
  id?: string;
  label?: string;
  value?: string;
  isAlwaysSelected?: boolean;
}

export const transformServerData = (
  data: ApplicationForm,
  mode: 'application' | 'survey',
): FormValues => {
  const formItems =
    mode === 'application' ? data.dynamicForm : data.dynamicSurveyResponseDto;

  const informationText = data.informationText || '';
  const title = data.title || '';

  if (!formItems) {
    return { informationText, questions: [], title };
  }

  const filteredFormItems = formItems.filter(
    (item) => (item.formType as unknown as string) !== 'PRIVACYCONSENT',
  );

  const itemsWithIds = filteredFormItems.map((item) => {
    let questionId: string;
    let options: Option[] = [];

    try {
      if (typeof item.jsonData === 'string') {
        const parsed = JSON.parse(item.jsonData);

        if (parsed.id) {
          questionId = parsed.id;

          if (parsed.options && Array.isArray(parsed.options)) {
            options = parsed.options.map((opt: JsonOption) => ({
              id: opt.id || crypto.randomUUID(),
              value: opt.label || opt.value || '',
              label: opt.label ?? opt.value ?? '',
              isAlwaysSelected: opt.isAlwaysSelected,
            }));
          }
        } else {
          questionId = crypto.randomUUID();
          options = Object.entries(parsed).map(([_key, value]): Option => {
            if (
              typeof value === 'object' &&
              value !== null &&
              'value' in value
            ) {
              const objValue = value as {
                value: string;
                isAlwaysSelected?: boolean;
              };
              return {
                id: crypto.randomUUID(),
                value: objValue.value,
                label: objValue.value,
                isAlwaysSelected: objValue.isAlwaysSelected || false,
              };
            }
            return {
              id: crypto.randomUUID(),
              value: value as string,
              label: value as string,
            };
          });
        }
      } else {
        questionId = crypto.randomUUID();
      }
    } catch (error) {
      console.error(error);
      questionId = crypto.randomUUID();
    }

    return {
      ...item,
      _generatedId: questionId,
      _generatedOptions: options,
    };
  });

  const questions = itemsWithIds.map((item) => {
    let otherJson = item.otherJson;
    if (otherJson) {
      try {
        const parsed = JSON.parse(otherJson);
        if (parsed.conditional?.parentIndex !== undefined) {
          const parentItem = itemsWithIds[parsed.conditional.parentIndex];
          if (parentItem?._generatedId) {
            parsed.conditional = {
              parentId: parentItem._generatedId,
              triggerValue: parsed.conditional.triggerValue,
            };
            otherJson = JSON.stringify(parsed);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    return {
      id: item._generatedId,
      title: item.title,
      formType: item.formType,
      options: item._generatedOptions,
      requiredStatus: item.requiredStatus,
      otherJson,
      dynamicFormType: item.dynamicFormType || 'DEFAULT',
    };
  });

  return {
    informationText,
    title,
    questions,
  };
};
