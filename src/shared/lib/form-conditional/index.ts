import type { DynamicFormItem } from '@/shared/types/application/type';

/**
 * 문항의 `otherJson.conditional`을 현재 답변에 비춰 노출 여부를 정한다.
 * 부모가 숨겨져 있으면 자식도 숨긴다(숨기기 전에 남은 부모 값으로 보이지 않게).
 */
export const isFieldVisible = (
  item: DynamicFormItem,
  items: DynamicFormItem[],
  values: Record<string, unknown>,
): boolean => {
  const conditional = item.otherJson?.conditional;
  const parent = conditional && items[conditional.parentIndex];
  if (!parent) return true;
  // 부모는 항상 앞에 있다. 순환 참조가 와도 무한 재귀하지 않도록 앞쪽 부모만 따라간다.
  if (
    conditional.parentIndex < items.indexOf(item) &&
    !isFieldVisible(parent, items, values)
  ) {
    return false;
  }

  const triggers = conditional.triggerValues ?? [conditional.triggerValue];
  const parentValue = values[String(parent.id)];
  return Array.isArray(parentValue)
    ? (parentValue as string[]).some((value) => triggers.includes(value))
    : triggers.includes(parentValue as string);
};
