import {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { processFormField } from './processFormField';
import { resolveFieldValue } from './resolveFieldValue';

export const processDynamicFormData = (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
): Record<string, string> => {
  return dynamicFormItems.reduce<Record<string, string>>((acc, form) => {
    acc[form.title] = processFormField(
      form.title,
      resolveFieldValue(data, form),
      form.formType,
    );
    return acc;
  }, {});
};
