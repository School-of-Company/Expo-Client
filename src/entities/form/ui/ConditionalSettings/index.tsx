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
  const currentFormType = useWatch({
    control,
    name: `questions.${currentIndex}.formType`,
  });

  const parseConditional = (
    otherJson: string | null,
  ): ConditionalSettingsType => {
    if (!otherJson) return { hasEtc: false };
    try {
      const parsed = JSON.parse(otherJson);
      return {
        hasEtc: parsed.hasEtc || false,
        maxSelection: parsed.maxSelection || null,
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
  const [parentId, setParentId] = useState<string | null>(
    currentSettings.conditional?.parentId ?? null,
  );
  const [triggerValue, setTriggerValue] = useState<string | null>(
    currentSettings.conditional?.triggerValue ?? null,
  );
  const [maxSelection, setMaxSelection] = useState<number | null>(
    currentSettings.maxSelection ?? null,
  );

  const availableParents =
    questions
      ?.slice(0, currentIndex)
      .filter((q) => ['MULTIPLE', 'CHECKBOX'].includes(q.formType)) || [];

  const updateOtherJson = (
    hasEtc: boolean,
    conditional: { parentId: string; triggerValue: string | null } | null,
    maxSelectionValue: number | null = maxSelection,
  ) => {
    const newValue = JSON.stringify({
      hasEtc,
      maxSelection: maxSelectionValue || undefined,
      conditional: conditional || undefined,
    });
    setValue(`questions.${currentIndex}.otherJson`, newValue);
  };

  const handleConditionalToggle = (enabled: boolean) => {
    setIsConditional(enabled);
    if (!enabled) {
      setParentId(null);
      setTriggerValue(null);
      updateOtherJson(currentSettings.hasEtc, null);
    } else {
      setValue(`questions.${currentIndex}.requiredStatus`, false);
    }
  };

  const handleParentChange = (questionId: string) => {
    setParentId(questionId);
    setTriggerValue(null);
    updateOtherJson(currentSettings.hasEtc, {
      parentId: questionId,
      triggerValue: null,
    });
  };

  const handleTriggerChange = (value: string) => {
    setTriggerValue(value);
    if (parentId !== null) {
      updateOtherJson(currentSettings.hasEtc, {
        parentId,
        triggerValue: value,
      });
    }
  };

  const handleMaxSelectionChange = (value: string) => {
    const numValue = value ? Number(value) : null;
    setMaxSelection(numValue);
    updateOtherJson(
      currentSettings.hasEtc,
      currentSettings.conditional
        ? {
            parentId: parentId!,
            triggerValue: triggerValue!,
          }
        : null,
      numValue,
    );
  };

  const selectedParent = questions?.find((q) => q.id === parentId);
  const parentOptions = selectedParent?.options || [];

  return (
    <div className="space-y-12 border-t border-gray-100 pt-16">
      {currentFormType === 'CHECKBOX' && (
        <div className="space-y-8">
          <label className="flex items-center gap-8">
            <p className="text-caption1r text-black mobile:text-caption2r">
              최대 선택 개수
            </p>
          </label>
          <div className="ml-24">
            <input
              type="number"
              min="1"
              placeholder="제한 없음"
              value={maxSelection || ''}
              onChange={(e) => handleMaxSelectionChange(e.target.value)}
              className="w-[120px] rounded-sm border border-gray-300 px-12 py-6 text-body2r"
            />
            <span className="ml-8 text-caption1r text-gray-500"> 개 </span>
          </div>
        </div>
      )}

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
              value={parentId ?? ''}
              onChange={(e) => handleParentChange(e.target.value)}
              className="inline-flex rounded-sm border border-gray-300 px-12 py-6 text-body2r"
            >
              <option value="">연결할 질문 선택</option>
              {availableParents.map((question, idx) => (
                <option key={question.id} value={question.id}>
                  {idx + 1}. {question.title || '(제목 없음)'}
                </option>
              ))}
            </select>

            <span>에서</span>

            {parentId !== null && parentOptions.length > 0 && (
              <>
                <select
                  value={triggerValue ?? ''}
                  onChange={(e) => handleTriggerChange(e.target.value)}
                  className="inline-flex rounded-sm border border-gray-300 px-12 py-6 text-body2r"
                >
                  <option value="">선택 시 표시될 값</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id || opt.value} value={opt.id}>
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
