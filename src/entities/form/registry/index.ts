import { checkboxField } from './checkbox';
import { dropdownField } from './dropdown';
import { multipleField } from './multiple';
import { sentenceField } from './sentence';
import type { FieldDefinition } from './model';
import type { DynamicFormItem } from '@/shared/types/application/type';

// 임시: foundation 브랜치가 레지스트리 index를 만들면 그쪽으로 합친다.
// IMAGE·COMPANION·REGION은 form-renderer-complex 브랜치가 등록한다.
export const fieldRegistry: Partial<
  Record<DynamicFormItem['formType'], FieldDefinition>
> = {
  SENTENCE: sentenceField,
  CHECKBOX: checkboxField,
  DROPDOWN: dropdownField,
  MULTIPLE: multipleField,
};

export * from './model';
