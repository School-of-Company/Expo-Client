import { slugify } from '@/shared/model';
import {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { processFormField } from './processFormField';

export const processDynamicFormData = (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
): Record<string, string> => {
  return dynamicFormItems.reduce<Record<string, string>>((acc, form) => {
    const slug = slugify(form.title);
    const value = data[slug];
    acc[form.title] = processFormField(form.title, value, form.formType);
    return acc;
  }, {});
};
