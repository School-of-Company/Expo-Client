import { v4 as uuidv4 } from 'uuid';
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

  const questions = filteredFormItems.map((item) => {
    let questionId: string;
    let options: Option[] = [];

    try {
      if (typeof item.jsonData === 'string') {
        const parsed = JSON.parse(item.jsonData);

        if (parsed.id) {
          questionId = parsed.id;

          if (parsed.options && Array.isArray(parsed.options)) {
            options = parsed.options.map((opt: JsonOption) => ({
              id: opt.id || uuidv4(),
              value: opt.label || opt.value || '',
              label: opt.label ?? opt.value ?? '',
              isAlwaysSelected: opt.isAlwaysSelected,
            }));
          }
        } else {
          questionId = uuidv4();
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
                id: uuidv4(),
                value: objValue.value,
                label: objValue.value,
                isAlwaysSelected: objValue.isAlwaysSelected || false,
              };
            }
            return {
              id: uuidv4(),
              value: value as string,
              label: value as string,
            };
          });
        }
      } else {
        questionId = uuidv4();
      }
    } catch (error) {
      console.error(error);
      questionId = uuidv4();
    }

    let otherJson = item.otherJson;
    if (otherJson) {
      try {
        const parsed = JSON.parse(otherJson);
        if (parsed.conditional?.parentIndex !== undefined) {
          const parentQuestion = questions[parsed.conditional.parentIndex];
          if (parentQuestion?.id) {
            parsed.conditional = {
              parentId: parentQuestion.id,
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
      id: questionId,
      title: item.title,
      formType: item.formType,
      options,
      requiredStatus: item.requiredStatus,
      otherJson,
    };
  });

  return {
    informationText,
    title,
    questions: filteredFormItems.map((item) => {
      let parsedJsonData: Record<string, string> = {};
      try {
        if (typeof item.jsonData === 'string') {
          parsedJsonData = JSON.parse(item.jsonData);
        } else if (item.jsonData) {
          parsedJsonData = item.jsonData;
        }
      } catch (error) {
        console.error('Error parsing jsonData:', error);
      }

      return {
        title: item.title,
        formType: item.formType,
        options: Object.entries(parsedJsonData).map(([_key, value]): Option => {
          if (typeof value === 'object' && value !== null && 'value' in value) {
            const objValue = value as {
              value: string;
              isAlwaysSelected?: boolean;
            };
            return {
              value: objValue.value,
              label: objValue.value,
              isAlwaysSelected: objValue.isAlwaysSelected || false,
            };
          }
          return {
            value: value as string,
            label: value as string,
          };
        }),
        requiredStatus: item.requiredStatus,
        otherJson: item.otherJson,
        dynamicFormType: item.dynamicFormType || 'DEFAULT',
      };
    }),
  };
};
