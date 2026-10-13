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
  // 답을 받을 수 없으니 필수 문항이면 막는다. 그냥 통과시키면 필수 답이 빠진 채 제출된다.
  validate: (item) =>
    item.requiredStatus ? '아직 지원하지 않는 항목입니다' : undefined,
  toAnswer: () => undefined,
};
