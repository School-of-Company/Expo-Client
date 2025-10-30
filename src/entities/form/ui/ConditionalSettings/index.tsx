'use client';

import { useState } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import {
  FormValues,
  ConditionalSettings as ConditionalSettingsType,
} from '@/shared/types/form/create/type';
import ToggleButton from '@/shared/ui/ToggleButton';

interface Props {
  currentIndex: number;
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

const ConditionalSettings = ({ currentIndex, control, setValue }: Props) => {
  const questions = useWatch({ control, name: 'questions' });
  const currentOtherJson = useWatch({
    control,
    name: `questions.${currentIndex}.otherJson`,
  });

  const parseConditional = (
    otherJson: string | null,
  ): ConditionalSettingsType => {
    if (!otherJson) return { hasEtc: false };
    try {
      const parsed = JSON.parse(otherJson);
      return {
        hasEtc: parsed.hasEtc || false,
        conditional: parsed.conditional || undefined,
      };
    } catch {
      return { hasEtc: otherJson === 'etc' };
    }
  };

  const currentSettings = parseConditional(currentOtherJson);
  const [isConditional, setIsConditional] = useState(
    !!currentSettings.conditional,
  );
  const [parentIndex, setParentIndex] = useState<number | null>(
    currentSettings.conditional?.parentIndex ?? null,
  );
  const [triggerValue, setTriggerValue] = useState<string | null>(
    currentSettings.conditional?.triggerValue ?? null,
  );

  const availableParents =
    questions
      ?.slice(0, currentIndex)
      .map((q, idx) => ({ question: q, index: idx }))
      .filter(({ question }) =>
        ['MULTIPLE', 'CHECKBOX'].includes(question.formType),
      ) || [];

  const updateOtherJson = (
    hasEtc: boolean,
    conditional: { parentIndex: number; triggerValue: string | null } | null,
  ) => {
    const newValue = JSON.stringify({
      hasEtc,
      conditional: conditional || undefined,
    });
    setValue(`questions.${currentIndex}.otherJson`, newValue);
  };

  const handleConditionalToggle = (enabled: boolean) => {
    setIsConditional(enabled);
    if (!enabled) {
      setParentIndex(null);
      setTriggerValue(null);
      updateOtherJson(currentSettings.hasEtc, null);
    } else {
      setValue(`questions.${currentIndex}.requiredStatus`, false);
    }
  };

  const handleParentChange = (index: number) => {
    setParentIndex(index);
    setTriggerValue(null);
    updateOtherJson(currentSettings.hasEtc, {
      parentIndex: index,
      triggerValue: null,
    });
  };

  const handleTriggerChange = (value: string) => {
    setTriggerValue(value);
    if (parentIndex !== null) {
      updateOtherJson(currentSettings.hasEtc, {
        parentIndex,
        triggerValue: value,
      });
    }
  };

  const parentOptions =
    (parentIndex !== null && questions?.[parentIndex]?.options) || [];

  return (
    <div className="space-y-12 border-t border-gray-100 pt-16">
      <label className="flex items-center gap-8">
        <p className="text-caption1r text-black mobile:text-caption2r">
          조건부 질문
        </p>
        <ToggleButton
          value={isConditional}
          onChange={handleConditionalToggle}
        />
      </label>

      {isConditional && (
        <div className="ml-24 rounded-sm bg-gray-50 p-16">
          <div className="flex flex-wrap items-center gap-8 text-body2r text-gray-700">
            <select
              value={parentIndex ?? ''}
              onChange={(e) => handleParentChange(Number(e.target.value))}
              className="inline-flex rounded-sm border border-gray-300 px-12 py-6 text-body2r"
            >
              <option value="">연결할 질문 선택</option>
              {availableParents.map(({ question, index }) => (
                <option key={index} value={index}>
                  {index + 1}. {question.title || '(제목 없음)'}
                </option>
              ))}
            </select>

            <span>에서</span>

            {parentIndex !== null && parentOptions.length > 0 && (
              <>
                <select
                  value={triggerValue ?? ''}
                  onChange={(e) => handleTriggerChange(e.target.value)}
                  className="inline-flex rounded-sm border border-gray-300 px-12 py-6 text-body2r"
                >
                  <option value="">선택 시 표시될 값</option>
                  {parentOptions.map((opt, idx) => (
                    <option key={idx} value={String(idx + 1)}>
                      {opt.value}
                    </option>
                  ))}
                </select>
                <span>를 선택하면 이 질문이 표시됩니다</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionalSettings;
