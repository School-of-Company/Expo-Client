import { FORM_TYPE_SPEC } from '@/entities/form/model/formTypes';
import type { DynamicFormItem } from '@/shared/types/application/type';

/**
 * 문항별 경고. 키는 문항 인덱스. 비어 있으면 저장해도 된다.
 * 조건부 규칙은 정렬·삭제 보정(fieldOps) 뒤에도 남는 문제만 잡는다. 사용자가 직접 고쳐야 한다.
 * 프로그램용 폼 전용 규칙(금지 유형·제목 중복)은 `validateProgramForm`이 맡는다.
 */
export const validateFields = (list: readonly DynamicFormItem[]) => {
  const warnings = new Map<number, string[]>();
  const warn = (index: number, message: string) =>
    warnings.set(index, [...(warnings.get(index) ?? []), message]);

  // 서버가 400(선택지 누락 등)으로 거절하는 모양을 먼저 막는다.
  list.forEach((item, index) => {
    if (!item.title.trim()) warn(index, '질문을 입력해주세요.');
    if (!FORM_TYPE_SPEC[item.formType].hasOptions) return;
    const labels = Object.values(item.jsonData).map((option) =>
      typeof option === 'string' ? option : option.value,
    );
    if (labels.length === 0 || labels.some((label) => !label.trim()))
      warn(index, '비어 있는 선택지가 있습니다.');
  });

  list.forEach((item, index) => {
    const conditional = item.otherJson?.conditional;
    if (!conditional) return;

    const { parentIndex, triggerValue, triggerValues } = conditional;
    const parent = list[parentIndex];
    if (!parent || parentIndex === index) {
      warn(index, '조건의 부모 문항이 없습니다.');
      return;
    }
    if (parentIndex > index) {
      warn(
        index,
        `부모 문항(${parentIndex + 1}번)이 이 문항보다 뒤에 있습니다.`,
      );
    }
    if (!FORM_TYPE_SPEC[parent.formType].canBeParent) {
      warn(index, `부모 문항(${parentIndex + 1}번)이 선택형이 아닙니다.`);
      return;
    }

    const triggers =
      triggerValues ?? (triggerValue === undefined ? [] : [triggerValue]);
    if (triggers.length === 0) {
      warn(index, '조건 값을 선택해주세요.');
    } else if (triggers.some((key) => !(key in parent.jsonData))) {
      warn(index, '부모 문항에 없는 선택지가 조건에 있습니다.');
    }
  });

  const seen = new Map<string, number>();
  list.forEach((item, index) => {
    const type = item.dynamicFormType;
    if (!type || type === 'DEFAULT') return;
    if (seen.has(type)) warn(index, `${type} 문항이 이미 있습니다.`);
    else seen.set(type, index);
  });

  return warnings;
};
