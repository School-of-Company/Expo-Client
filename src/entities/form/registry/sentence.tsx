'use client';

import type { FieldDefinition, FieldRendererProps } from './model';
import type { DynamicFormItem } from '@/shared/types/application/type';

const PHONE_PATTERN = /^01\d{8,9}$/;

const isPhone = (item: DynamicFormItem) =>
  item.dynamicFormType === 'PHONE_NUMBER';

/** 숫자만 남긴 번호를 `010-1234-5678` 모양으로 보여 준다. */
export const formatPhone = (digits: string) => {
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, -4)}-${digits.slice(-4)}`;
};

const normalize = (item: DynamicFormItem, value: unknown) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return isPhone(item) ? text.replace(/\D/g, '') : text;
};

function SentenceRenderer({ item, value, onChange }: FieldRendererProps) {
  const text = typeof value === 'string' ? value : '';
  const phone = isPhone(item);

  return (
    <div className="flex flex-col gap-8">
      <input
        className="w-full bg-transparent text-body2r text-black"
        value={phone ? formatPhone(text) : text}
        inputMode={phone ? 'numeric' : undefined}
        maxLength={phone ? 13 : 500}
        placeholder={phone ? '010-0000-0000' : item.title}
        onChange={(e) =>
          onChange(
            phone
              ? e.target.value.replace(/\D/g, '').slice(0, 11)
              : e.target.value,
          )
        }
      />
      <hr className="border-gray-100" />
    </div>
  );
}

export const sentenceField: FieldDefinition = {
  Renderer: SentenceRenderer,
  defaultValue: () => '',
  validate: (item, value) => {
    const text = normalize(item, value);
    if (!text)
      return item.requiredStatus ? '필수 항목을 입력해주세요' : undefined;
    if (isPhone(item) && !PHONE_PATTERN.test(text)) {
      return '휴대폰 번호 형식이 올바르지 않습니다';
    }
  },
  toAnswer: (item, value) => normalize(item, value) || undefined,
};
