import { DynamicFormValues } from '@/shared/types/application/type';

export const processFormField = (
  title: string,
  value: unknown,
  formType: string,
  allData: DynamicFormValues,
): string => {
  if (
    value === undefined ||
    value === null ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return '';
  }

  if (formType === 'CHECKBOX' || formType === 'MULTIPLE') {
    const selectedOptions = Array.isArray(value) ? value : [value];
    return selectedOptions
      .map((option) =>
        option === 'etc'
          ? `기타: ${
              Array.isArray(allData[`${title}_etc`])
                ? (allData[`${title}_etc`] as string[]).join(', ')
                : allData[`${title}_etc`] || ''
            }`
          : String(option),
      )
      .join(', ');
  }

  return String(value || '');
};
