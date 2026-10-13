'use client';

import type { FieldDefinition, FieldRendererProps } from './model';

function PlaceholderRenderer({ item }: FieldRendererProps) {
  return (
    <p className="text-caption1r text-gray-400">{item.formType} 준비 중</p>
  );
}

/** 아직 구현하지 않은 타입의 빈 슬롯. 담당 브랜치가 자기 파일에서 실제 정의로 바꾼다. */
export const placeholderField: FieldDefinition = {
  Renderer: PlaceholderRenderer,
  defaultValue: () => undefined,
  validate: () => undefined,
  toAnswer: () => undefined,
};
