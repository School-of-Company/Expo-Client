import type {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';

/**
 * 렌더러(FieldRenderer)는 질문을 서버 문항 id 키로 등록하고, 선택지 값은 `jsonData` 키로 저장한다.
 * 제출 데이터를 읽는 쪽은 이 함수를 통해 사람이 읽을 수 있는 값(보기 문구)으로 되돌린다.
 */
export const resolveFieldValue = (
  data: DynamicFormValues,
  item: DynamicFormItem,
): string | string[] | boolean | undefined => {
  const raw = data[String(item.id)];

  const toLabel = (value: string): string => {
    if (!Object.hasOwn(item.jsonData, value)) return value;
    const option = item.jsonData[value];
    return typeof option === 'string' ? option : option.value;
  };

  if (Array.isArray(raw)) return raw.map(toLabel);
  return typeof raw === 'string' ? toLabel(raw) : raw;
};
