import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { processFormField } from './processFormField';
import { replaceEtcValue } from './replaceEtcValue';

export const processDynamicFormData = (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
): Record<string, string> => {
  return dynamicFormItems.reduce<Record<string, string>>((acc, form) => {
    const slug = slugify(form.title);
    const value = data[slug];
    const etcTextValue = data[`${slug}-etc-text`] as string | undefined;

    const isMultiSelectType =
      form.formType === 'CHECKBOX' || form.formType === 'MULTIPLE';
    const processedValue = isMultiSelectType
      ? replaceEtcValue(value, etcTextValue)
      : value;

    acc[form.title] = processFormField(
      form.title,
      processedValue,
      form.formType,
    );
    return acc;
  }, {});
};
