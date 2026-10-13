import type { ComponentType } from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import type { DynamicFormItem } from '@/shared/types/application/type';

// ponytail: 임시 계약. foundation 브랜치의 레지스트리 타입이 나오면 그쪽으로 바꾼다.

/** 문항 유형별 검사·제출 변환. 화면과 떨어진 순수 함수라 entities에 둔다. */
export interface FieldModel<V> {
  /** 통과하면 `true`, 아니면 사용자에게 보일 에러 문구. RHF `rules.validate`에 그대로 넘긴다. */
  validate: (value: V | undefined, item: DynamicFormItem) => true | string;
  /** 폼 값 → 서버에 실을 답변. */
  serialize: (value: V | undefined, item: DynamicFormItem) => unknown;
}

export interface FieldRendererProps {
  item: DynamicFormItem;
  /** RHF 필드 이름. 보통 서버 문항 id. */
  name: string;
  control: Control<FieldValues>;
}

export type FieldDefinition<V> = FieldModel<V> & {
  Renderer: ComponentType<FieldRendererProps>;
};
