import {
  LEGACY_OCCUPATION_LABEL,
  OCCUPATION_OPTIONS,
  occupationRank,
} from '../constants/occupationData';
import type {
  Companion,
  DynamicFormItem,
} from '@/shared/types/application/type';
import type { ComponentType } from 'react';

export type FieldValue = string | boolean | string[] | Companion[] | undefined;
export type AnswerValue = string | boolean | string[] | Companion[];

/** "기타" 선택지 값. 직접 입력한 문구는 `etcKey(id)` 필드에 따로 둔다. */
export const ETC_KEY = '__etc__';
export const etcKey = (fieldId: string) => `${fieldId}__etc`;

export interface FieldRendererProps {
  item: DynamicFormItem;
  value: FieldValue;
  etc: string;
  onChange: (value: FieldValue) => void;
  onEtcChange: (value: string) => void;
}

export interface FieldDefinition {
  Renderer: ComponentType<FieldRendererProps>;
  defaultValue: (item: DynamicFormItem) => FieldValue;
  /** 오류 문구, 통과면 undefined. */
  validate: (
    item: DynamicFormItem,
    value: FieldValue,
    etc: string,
  ) => string | undefined;
  /** 서버 답변 값, 생략할 답이면 undefined. */
  toAnswer: (
    item: DynamicFormItem,
    value: FieldValue,
    etc: string,
  ) => AnswerValue | undefined;
}

export const optionEntries = (item: DynamicFormItem) => {
  const entries = Object.entries(item.jsonData).map(([key, option]) => ({
    key,
    label: typeof option === 'string' ? option : option.value,
    isAlwaysSelected: typeof option !== 'string' && option.isAlwaysSelected,
  }));
  if (item.dynamicFormType !== 'OCCUPATION') return entries;
  // 직업은 저장 순서·문구가 아니라 고정 순서·문구로 보이고, 교직원 같은 예전 선택지는 새 신청에서 숨긴다
  return entries
    .filter(({ key }) => !(key in LEGACY_OCCUPATION_LABEL))
    .sort((a, b) => occupationRank(a.key) - occupationRank(b.key))
    .map((entry) => ({
      ...entry,
      label:
        OCCUPATION_OPTIONS.find(({ key }) => key === entry.key)?.label ??
        entry.label,
    }));
};

export const alwaysSelectedKeys = (item: DynamicFormItem) =>
  optionEntries(item)
    .filter((option) => option.isAlwaysSelected)
    .map((option) => option.key);

/** "기타"를 입력 문구로 바꾼다. 빈 문구면 빈 문자열. */
export const resolveEtc = (value: string, etc: string) =>
  // ponytail: 서버 기타 답변 형식 미확정 — 지금은 키 자리에 입력 문구를 그대로 싣는다. 계약 확인 후 여기만 고친다.
  value === ETC_KEY ? etc.trim() : value;
