'use client';

import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { FormSchema } from '@/features/form/common/model/formSchema';
import { useLeaveConfirm } from '@/shared/model';
import { collectErrorMessages } from '../lib/collectErrorMessages';
import { FormValues, getVisibleFieldIds } from '../lib/visibilityEngine';
import FieldRenderer, { LockedPhone, OccupationLock } from './FieldRenderer';

interface FormRendererProps {
  schema: FormSchema;
  onSubmit: (data: FormValues) => void;
  defaultValues?: FormValues;
  renderFooter?: (methods: UseFormReturn<FormValues>) => React.ReactNode;
  /** 회차 잔여석 등 폼 정의 밖에서 오는 동행자 상한. */
  companionMaxCount?: number;
  /** 유형별 오픈 시각 전에 고를 수 없는 직업을 막는다 */
  occupationLock?: OccupationLock;
  /** 휴대폰 인증한 번호를 전화번호 문항에 채우고 잠근다 */
  lockedPhone?: LockedPhone;
}

export default function FormRenderer({
  schema,
  onSubmit,
  defaultValues = {},
  renderFooter,
  companionMaxCount,
  occupationLock,
  lockedPhone,
}: FormRendererProps) {
  const methods = useForm<FormValues>({
    defaultValues: lockedPhone
      ? {
          ...defaultValues,
          [lockedPhone.fieldId]: lockedPhone.value,
        }
      : defaultValues,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods;

  useLeaveConfirm(isDirty);

  // 숨겨진 부모의 옛 값이 남아 있어도 자식이 뜨지 않도록 부모 연쇄까지 본다
  const visibleIds = getVisibleFieldIds(schema.items, watch());
  const errorMessages = collectErrorMessages(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-20">
      {schema.title && (
        <div className="mb-32">
          <h2 className="text-h2b text-black">{schema.title}</h2>
          {schema.description && (
            <p className="mt-8 text-body1r text-gray-600">
              {schema.description}
            </p>
          )}
        </div>
      )}

      {schema.items.map((item) => (
        <FieldRenderer
          key={item.id}
          item={item}
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          companionMaxCount={companionMaxCount}
          occupationLock={occupationLock}
          lockedPhone={lockedPhone}
          visible={visibleIds.has(item.id)}
        />
      ))}

      {errorMessages.length > 0 && (
        <div className="bg-error-50 rounded-sm p-16">
          <p className="text-body2b text-error">입력 내용을 확인해주세요</p>
          <ul className="mt-8 list-disc pl-20">
            {errorMessages.map((message) => (
              <li key={message} className="text-caption1r text-error">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {renderFooter ? (
        renderFooter(methods)
      ) : (
        <button
          type="submit"
          className="hover:bg-main-700 w-full rounded-sm bg-main-600 py-16 text-h3b text-white"
        >
          제출하기
        </button>
      )}
    </form>
  );
}
