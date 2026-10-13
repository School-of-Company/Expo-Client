'use client';

import type { FieldDefinition, FieldRendererProps } from './model';

/** 단일 예/아니오. 답변은 boolean. */
function CheckboxRenderer({ item, value, onChange }: FieldRendererProps) {
  return (
    <label className="flex cursor-pointer items-center gap-12">
      <input
        type="checkbox"
        className="h-16 w-16 accent-blue-500"
        checked={value === true}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-body2r text-black">{item.title}</span>
    </label>
  );
}

export const checkboxField: FieldDefinition = {
  Renderer: CheckboxRenderer,
  defaultValue: () => false,
  validate: (item, value) =>
    item.requiredStatus && value !== true ? '체크해주세요' : undefined,
  toAnswer: (_, value) => value === true,
};
