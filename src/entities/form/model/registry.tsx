import OptionListEditor, {
  FieldEditorProps,
} from '@/entities/form/ui/OptionListEditor';
import {
  CheckBoxIcon,
  DropDown,
  MultipleChoice,
  Typing,
} from '@/shared/assets/icons';
import { FORM_TYPE_SPEC, FormType, FormTypeSpec } from './formTypes';
import type { ComponentType, ReactNode } from 'react';

export interface FormTypeEntry extends FormTypeSpec {
  icon?: ReactNode;
  /** 관리자 빌더의 타입별 설정 UI. 없으면 공통 설정만 보인다. */
  Editor?: ComponentType<FieldEditorProps>;
  // Renderer 슬롯은 응답자 렌더러 작업에서 추가한다.
}

const extra: Partial<Record<FormType, Partial<FormTypeEntry>>> = {
  SENTENCE: { icon: <Typing /> },
  CHECKBOX: { icon: <CheckBoxIcon /> },
  DROPDOWN: { icon: <DropDown />, Editor: OptionListEditor },
  MULTIPLE: { icon: <MultipleChoice />, Editor: OptionListEditor },
};

export const formTypeRegistry = Object.fromEntries(
  Object.entries(FORM_TYPE_SPEC).map(([type, spec]) => [
    type,
    { ...spec, ...extra[type as FormType] },
  ]),
) as Record<FormType, FormTypeEntry>;

export type { FieldEditorProps };
