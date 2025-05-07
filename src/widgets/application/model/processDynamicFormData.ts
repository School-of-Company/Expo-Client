import { slugify } from '@/shared/model/slugify';
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
    const slug = slugify(form.title); // 👈 폼 등록 시 사용한 키로 접근
    const value = data[slug]; // 👈 slugified key로 접근
    acc[form.title] = processFormField(form.title, value, form.formType, data);
    return acc;
  }, {});
};
