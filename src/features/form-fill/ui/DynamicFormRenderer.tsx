'use client';

import React, { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { etcKey, fieldRegistry } from '@/entities/form/registry';
import { isFieldVisible } from '@/shared/lib/form-conditional';
import {
  FillValues,
  getDefaultValues,
  toSubmitPayload,
  validateForm,
} from '../lib/toSubmitPayload';
import type {
  DynamicFormItem,
  SurveyAnswers,
} from '@/shared/types/application/type';

interface DynamicFormRendererProps {
  /** `FormResponseDto.dynamicForm` (설문은 `dynamicSurveyResponseDto`). */
  dynamicForm: DynamicFormItem[];
  onSubmit: (answers: SurveyAnswers, values: FillValues) => void;
  renderFooter?: (methods: UseFormReturn<FillValues>) => React.ReactNode;
}

export default function DynamicFormRenderer({
  dynamicForm,
  onSubmit,
  renderFooter,
}: DynamicFormRendererProps) {
  const methods = useForm<FillValues>({
    defaultValues: getDefaultValues(dynamicForm),
    resolver: (values) => {
      const errors = validateForm(dynamicForm, values);
      return Object.keys(errors).length === 0
        ? { values, errors: {} }
        : {
            values: {},
            errors: Object.fromEntries(
              Object.entries(errors).map(([id, message]) => [
                id,
                { type: 'validate', message },
              ]),
            ),
          };
    },
  });
  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitted },
  } = methods;
  const values = watch();

  // 문항이 로딩 뒤에 들어와도 고정 선택지 기본값을 다시 잡는다.
  useEffect(() => {
    reset(getDefaultValues(dynamicForm));
  }, [dynamicForm, reset]);

  return (
    <form
      onSubmit={handleSubmit(
        (data) => onSubmit(toSubmitPayload(dynamicForm, data), data),
        // 등록(register)한 입력이 없어 RHF가 포커스를 못 옮긴다. 첫 오류 문항으로 직접 스크롤한다.
        (fieldErrors) => {
          const first = dynamicForm.find((item) => fieldErrors[item.id]);
          document
            .getElementById(`form-field-${first?.id}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
      )}
      className="space-y-20"
    >
      {dynamicForm.map((item, index) => {
        const definition = fieldRegistry[item.formType];
        if (!definition || !isFieldVisible(dynamicForm, values, index)) {
          return null;
        }
        const id = String(item.id);
        const etc = values[etcKey(id)];
        const error = errors[id]?.message;
        // 제출을 한 번 누른 뒤부터는 입력할 때마다 다시 검증한다.
        const set = (key: string, value: FillValues[string]) =>
          setValue(key, value, { shouldValidate: isSubmitted });

        return (
          <div
            key={id}
            id={`form-field-${id}`}
            className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18"
          >
            <div className="flex items-center gap-2">
              <p className="text-h3b text-black">{item.title}</p>
              {item.requiredStatus && <p className="text-main-600">*</p>}
            </div>
            <definition.Renderer
              item={item}
              value={values[id]}
              etc={typeof etc === 'string' ? etc : ''}
              onChange={(value) => set(id, value)}
              onEtcChange={(value) => {
                // 기타 문구 오류는 문항 id에 붙으므로 문항을 다시 검증한다.
                setValue(etcKey(id), value);
                if (isSubmitted) trigger(id);
              }}
            />
            {error && <p className="text-caption1r text-error">{error}</p>}
          </div>
        );
      })}

      {renderFooter ? (
        renderFooter(methods)
      ) : (
        <button
          type="submit"
          className="w-full rounded-sm bg-main-600 py-16 text-h3b text-white"
        >
          제출하기
        </button>
      )}
    </form>
  );
}
