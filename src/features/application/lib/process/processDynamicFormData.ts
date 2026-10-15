import {
  Companion,
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { processCompanions, processFormField } from './processFormField';
import { resolveFieldValue } from './resolveFieldValue';

export const processDynamicFormData = (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
): Record<string, string | Companion[]> => {
  return dynamicFormItems.reduce<Record<string, string | Companion[]>>(
    (acc, form) => {
      if (form.formType === 'COMPANION') {
        acc[form.title] = processCompanions(data[String(form.id)]);
        return acc;
      }
      acc[form.title] = processFormField(
        form.title,
        resolveFieldValue(data, form),
        form.formType,
      );
      return acc;
    },
    {},
  );
};
