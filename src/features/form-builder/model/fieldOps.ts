import { FORM_TYPE_SPEC, FormType } from '@/entities/form/model/formTypes';
import type {
  DynamicFormItem,
  OtherJson,
} from '@/shared/types/application/type';

type Conditional = NonNullable<OtherJson['conditional']>;

/**
 * 새 문항 임시 id. 서버 id(양수)와 겹치지 않게 음수로 줄여 나간다.
 * 7번 페이지가 저장할 때 음수 id는 빼고 보낸다.
 */
export const nextTempId = (list: readonly DynamicFormItem[]) =>
  Math.min(0, ...list.map((item) => item.id)) - 1;

/** 선택지 키는 순서가 아니라 안정 키다. 지워도 다시 매기지 않아야 trigger가 안 깨진다. */
export const nextOptionKey = (jsonData: DynamicFormItem['jsonData']) =>
  String(
    Math.max(0, ...Object.keys(jsonData).map(Number).filter(Number.isFinite)) +
      1,
  );

const withConditional = (
  item: DynamicFormItem,
  conditional: Conditional | undefined,
): DynamicFormItem => {
  const { conditional: _, ...rest } = item.otherJson ?? { hasEtc: false };
  return {
    ...item,
    otherJson: conditional ? { ...rest, conditional } : rest,
  };
};

/**
 * 문항 순서가 바뀐 뒤 `parentIndex`를 새 위치로 옮긴다.
 * `newIndexOf[old]`가 undefined면 부모가 사라진 것이라 조건을 지운다.
 * 원래부터 범위 밖이던 인덱스는 손대지 않고 경고(validateFields)에 맡긴다.
 */
const remapParents = (
  items: DynamicFormItem[],
  newIndexOf: (oldIndex: number) => number | undefined,
  oldLength: number,
) =>
  items.map((item) => {
    const conditional = item.otherJson?.conditional;
    if (!conditional) return item;
    const { parentIndex } = conditional;
    if (parentIndex < 0 || parentIndex >= oldLength) return item;
    const next = newIndexOf(parentIndex);
    if (next === undefined) return withConditional(item, undefined);
    if (next === parentIndex) return item;
    return withConditional(item, { ...conditional, parentIndex: next });
  });

export const createField = (
  list: readonly DynamicFormItem[],
  formType: FormType,
): DynamicFormItem => ({
  id: nextTempId(list),
  title: '',
  formType,
  jsonData: FORM_TYPE_SPEC[formType].hasOptions ? { '1': '' } : {},
  requiredStatus: false,
  otherJson: null,
  dynamicFormType: 'DEFAULT',
});

export const addField = (
  list: readonly DynamicFormItem[],
  formType: FormType,
) => [...list, createField(list, formType)];

export const removeField = (list: readonly DynamicFormItem[], index: number) =>
  remapParents(
    list.filter((_, i) => i !== index),
    (old) => (old < index ? old : old > index ? old - 1 : undefined),
    list.length,
  );

/** 바로 아래에 복제한다. 복제본은 원본의 조건을 그대로 갖고, 원본의 자식은 원본을 계속 본다. */
export const duplicateField = (
  list: readonly DynamicFormItem[],
  index: number,
) => {
  const copy: DynamicFormItem = {
    ...structuredClone(list[index]),
    id: nextTempId(list),
    // 특수 필드(이름·전화번호 등)는 하나만 있어야 하므로 복제본은 일반 문항이 된다.
    dynamicFormType: 'DEFAULT',
  };
  const inserted = [
    ...list.slice(0, index + 1),
    copy,
    ...list.slice(index + 1),
  ];
  return remapParents(
    inserted,
    (old) => (old <= index ? old : old + 1),
    list.length,
  );
};

export const moveField = (
  list: readonly DynamicFormItem[],
  from: number,
  to: number,
) => {
  if (from === to) return [...list];
  const order = list.map((_, i) => i);
  const [moved] = order.splice(from, 1);
  order.splice(to, 0, moved);
  const newIndexOf = new Map(order.map((old, next) => [old, next]));
  return remapParents(
    order.map((old) => list[old]),
    (old) => newIndexOf.get(old),
    list.length,
  );
};

export const updateField = (
  list: readonly DynamicFormItem[],
  index: number,
  item: DynamicFormItem,
) => list.map((current, i) => (i === index ? item : current));

/**
 * 부모 선택지에 없는 키를 자식 조건에서 뺀다.
 * 타입을 바꿔 선택지가 초기화된 뒤 같은 키('1')가 다른 뜻으로 다시 붙는 것을 막는다.
 */
const pruneTriggers = (list: DynamicFormItem[], parentIndex: number) => {
  const { jsonData } = list[parentIndex];
  return list.map((item) => {
    const conditional = item.otherJson?.conditional;
    if (conditional?.parentIndex !== parentIndex) return item;
    const { triggerValue, triggerValues, ...rest } = conditional;
    const next: Conditional = { ...rest };
    if (triggerValue !== undefined && triggerValue in jsonData)
      next.triggerValue = triggerValue;
    if (triggerValues)
      next.triggerValues = triggerValues.filter((key) => key in jsonData);
    return withConditional(item, next);
  });
};

/**
 * 타입을 바꾸면 새 타입이 못 쓰는 설정을 정리한다. 자식 조건은 경고로 남긴다.
 * API 계약상 `jsonData` 값은 문자열이라 예전 객체 선택지도 라벨 문자열로 바꾼다.
 */
export const changeFormType = (
  list: readonly DynamicFormItem[],
  index: number,
  formType: FormType,
) => {
  const item = list[index];
  const spec = FORM_TYPE_SPEC[formType];
  const jsonData = spec.hasOptions
    ? Object.keys(item.jsonData).length
      ? Object.fromEntries(
          Object.entries(item.jsonData).map(([key, option]) => [
            key,
            typeof option === 'string' ? option : option.value,
          ]),
        )
      : { '1': '' }
    : {};

  let otherJson = item.otherJson;
  if (otherJson) {
    const { maxSelection, hasEtc, ...rest } = otherJson;
    otherJson = {
      ...rest,
      hasEtc: spec.supportsEtc && hasEtc,
      ...(spec.supportsMaxSelection && maxSelection !== undefined
        ? { maxSelection }
        : {}),
    };
  }

  return pruneTriggers(
    updateField(list, index, { ...item, formType, jsonData, otherJson }),
    index,
  );
};

/** 선택지를 지우고, 그 키를 trigger로 쓰던 자식 조건에서 키를 뺀다. */
export const removeOption = (
  list: readonly DynamicFormItem[],
  index: number,
  key: string,
) =>
  list.map((item, i) => {
    if (i === index) {
      const { [key]: _, ...jsonData } = item.jsonData;
      const max = item.otherJson?.maxSelection;
      const count = Object.keys(jsonData).length;
      // 선택지를 줄였는데 최대 선택 개수가 그대로면 선택지 수에 맞춰 낮춘다.
      return {
        ...item,
        jsonData,
        otherJson:
          item.otherJson && max !== undefined && max > count
            ? { ...item.otherJson, maxSelection: count }
            : item.otherJson,
      };
    }
    const conditional = item.otherJson?.conditional;
    if (conditional?.parentIndex !== index) return item;
    const { triggerValue, triggerValues, ...rest } = conditional;
    const next: Conditional = { ...rest };
    if (triggerValue !== undefined && triggerValue !== key)
      next.triggerValue = triggerValue;
    if (triggerValues)
      next.triggerValues = triggerValues.filter((v) => v !== key);
    return withConditional(item, next);
  });
