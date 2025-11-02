import { ApplicationForm } from '@/shared/types/application/type';
import { FormValues, Option } from '@/shared/types/form/create/type';

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
      };
    }),
  };
};
