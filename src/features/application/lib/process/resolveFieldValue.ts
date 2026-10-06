import type {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';

/**
 * 렌더러(FieldRenderer)는 질문을 `jsonData.id`(UUID) 키로 등록하고,
 * 선택지 값은 `option.id`(UUID), 기타 입력값은 `${id}_etc` 키로 저장한다.
 * 제출 데이터를 읽는 쪽은 이 함수를 통해 사람이 읽을 수 있는 값으로 되돌린다.
 */

const ETC_LABEL = '기타';

interface ParsedField {
  id: string;
  options?: { id: string; label: string }[];
}

const parseField = (item: DynamicFormItem): ParsedField | null => {
  try {
    const parsed = JSON.parse(item.jsonData ?? '{}');
    return parsed?.id ? (parsed as ParsedField) : null;
  } catch {
    return null;
  }
};

export const getFieldId = (item: DynamicFormItem): string | undefined =>
  parseField(item)?.id;

export const resolveFieldValue = (
  data: DynamicFormValues,
  item: DynamicFormItem,
): string | string[] | undefined => {
  const field = parseField(item);
  if (!field) return undefined;

  const raw = data[field.id];
  const etcText = data[`${field.id}_etc`] as string | undefined;

  const toLabel = (value: string): string => {
    if (value === ETC_LABEL) return etcText || value;
    return field.options?.find((option) => option.id === value)?.label ?? value;
  };

  if (Array.isArray(raw)) return raw.map(toLabel);
  return typeof raw === 'string' ? toLabel(raw) : raw;
};
