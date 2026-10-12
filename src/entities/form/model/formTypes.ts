import type { DynamicFormItem } from '@/shared/types/application/type';

export type FormType = DynamicFormItem['formType'];

/** 문항 타입별 빌더 성질. React 없는 순수 데이터라 모델·점검 스크립트에서도 쓴다. */
export interface FormTypeSpec {
  label: string;
  /** `jsonData`에 선택지를 둔다. */
  hasOptions: boolean;
  /** 조건부 규칙의 부모가 될 수 있다. 선택지 키를 trigger로 쓴다. */
  canBeParent: boolean;
  supportsMaxSelection: boolean;
  supportsEtc: boolean;
}

const plain = {
  hasOptions: false,
  canBeParent: false,
  supportsMaxSelection: false,
  supportsEtc: false,
};

export const FORM_TYPE_SPEC: Record<FormType, FormTypeSpec> = {
  SENTENCE: { ...plain, label: '문장형' },
  CHECKBOX: { ...plain, label: '체크박스' },
  DROPDOWN: {
    ...plain,
    label: '드롭다운',
    hasOptions: true,
    canBeParent: true,
    supportsEtc: true,
  },
  MULTIPLE: {
    label: '객관식(복수 선택)',
    hasOptions: true,
    canBeParent: true,
    supportsMaxSelection: true,
    supportsEtc: true,
  },
  IMAGE: { ...plain, label: '이미지' },
  COMPANION: { ...plain, label: '동행자', supportsMaxSelection: true },
  REGION: { ...plain, label: '지역' },
};

/** 빌더 추가 메뉴에 노출하는 타입. 나머지는 서버에서 온 문항을 보존만 한다. */
export const BUILDER_FORM_TYPES: FormType[] = [
  'SENTENCE',
  'CHECKBOX',
  'DROPDOWN',
  'MULTIPLE',
];
