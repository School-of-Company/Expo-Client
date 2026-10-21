'use client';

import { FORM_TYPE_SPEC } from '@/entities/form/model/formTypes';
import { ToggleButton } from '@/shared/ui';
import type { DynamicFormItem } from '@/shared/types/application/type';

interface Props {
  list: readonly DynamicFormItem[];
  index: number;
  onChange: (item: DynamicFormItem) => void;
}

const optionText = (option: DynamicFormItem['jsonData'][string]) =>
  typeof option === 'string' ? option : option.value;

/** 앞 순서의 선택형 문항만 부모로 고를 수 있다. 선택한 값 중 하나면 이 문항이 보인다. */
const ConditionalRuleEditor = ({ list, index, onChange }: Props) => {
  const item = list[index];
  const otherJson = item.otherJson ?? { hasEtc: false };
  const conditional = otherJson.conditional;
  const candidates = list
    .map((field, i) => ({ field, i }))
    .filter(
      ({ field, i }) => i < index && FORM_TYPE_SPEC[field.formType].canBeParent,
    );

  const setConditional = (next: typeof conditional) => {
    const { conditional: _, ...rest } = otherJson;
    onChange({
      ...item,
      otherJson: next ? { ...rest, conditional: next } : rest,
    });
  };

  const selected =
    conditional?.triggerValues ??
    (conditional?.triggerValue !== undefined ? [conditional.triggerValue] : []);
  const parent = conditional ? list[conditional.parentIndex] : undefined;

  const toggleTrigger = (key: string) => {
    if (!conditional) return;
    const triggers = selected.includes(key)
      ? selected.filter((v) => v !== key)
      : [...selected, key];
    // 서버는 둘 중 하나만 받는다. 하나면 triggerValue, 여럿이면 triggerValues.
    setConditional(
      triggers.length === 1
        ? { parentIndex: conditional.parentIndex, triggerValue: triggers[0] }
        : { parentIndex: conditional.parentIndex, triggerValues: triggers },
    );
  };

  return (
    <div className="flex w-full flex-col gap-12 border-t-1 border-solid border-gray-100 pt-16">
      <label className="flex h-40 items-center gap-8 text-body2r text-gray-500">
        조건부 표시
        <ToggleButton
          value={!!conditional}
          disabled={!conditional && candidates.length === 0}
          onChange={(on) =>
            setConditional(
              on
                ? { parentIndex: candidates[0].i, triggerValues: [] }
                : undefined,
            )
          }
        />
        {!conditional && candidates.length === 0 && (
          <span className="text-caption2r text-gray-300">
            앞에 선택형 문항이 있어야 합니다.
          </span>
        )}
      </label>

      {conditional && (
        <div className="ml-24 space-y-8">
          <select
            value={conditional.parentIndex}
            onChange={(e) =>
              setConditional({
                parentIndex: Number(e.target.value),
                triggerValues: [],
              })
            }
            aria-label="부모 문항"
            className="w-full rounded-sm border-1 border-solid border-gray-100 bg-white px-12 py-10 text-body2r text-black"
          >
            {/* 정렬로 부모가 뒤로 밀려도 현재 값은 보여준다. */}
            {!candidates.some(({ i }) => i === conditional.parentIndex) && (
              <option value={conditional.parentIndex}>
                {conditional.parentIndex + 1}. {parent?.title || '(없는 문항)'}
              </option>
            )}
            {candidates.map(({ field, i }) => (
              <option key={field.id} value={i}>
                {i + 1}. {field.title || '(제목 없음)'}
              </option>
            ))}
          </select>

          {parent && FORM_TYPE_SPEC[parent.formType].canBeParent && (
            <fieldset className="flex flex-wrap gap-8">
              <legend className="mb-4 text-caption2r text-gray-500">
                이 값을 고르면 보입니다
              </legend>
              {Object.entries(parent.jsonData).map(([key, option]) => (
                <label
                  key={key}
                  className={`cursor-pointer rounded-sm border-1 border-solid px-10 py-4 text-caption1r ${
                    selected.includes(key)
                      ? 'border-main-600 bg-main-100 text-main-600'
                      : 'border-gray-100 text-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected.includes(key)}
                    onChange={() => toggleTrigger(key)}
                  />
                  {optionText(option) || `선택지 ${key}`}
                </label>
              ))}
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
};

export default ConditionalRuleEditor;
