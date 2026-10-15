import { checkboxField } from './checkbox';
import { companionField } from './companion';
import { dropdownField } from './dropdown';
import { imageField } from './image';
import { multipleField } from './multiple';
import { regionField } from './region';
import { sentenceField } from './sentence';
import type { FieldDefinition } from './model';
import type { FormType } from '../model/types';

/** formType → 필드 정의. 타입마다 자기 파일만 고치고, 여기는 모으기만 한다. */
export const fieldRegistry: Record<FormType, FieldDefinition> = {
  SENTENCE: sentenceField,
  CHECKBOX: checkboxField,
  DROPDOWN: dropdownField,
  MULTIPLE: multipleField,
  IMAGE: imageField,
  COMPANION: companionField,
  REGION: regionField,
};

export * from './model';
