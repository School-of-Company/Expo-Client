'use client';

import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { FormSchema } from '@/features/form/common/model/formSchema';
import { FormValues } from '../lib/visibilityEngine';
import FieldRenderer from './FieldRenderer';

interface FormRendererProps {
  schema: FormSchema;
  onSubmit: (data: FormValues) => void;
  defaultValues?: FormValues;
  renderFooter?: (methods: UseFormReturn<FormValues>) => React.ReactNode;
}

export default function FormRenderer({
  schema,
  onSubmit,
  defaultValues = {},
  renderFooter,
}: FormRendererProps) {
  const methods = useForm<FormValues>({
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = methods;

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
        />
      ))}

      {Object.keys(errors).length > 0 && (
        <div className="bg-error-50 rounded-sm p-16">
          <p className="text-body2b text-error">입력 내용을 확인해주세요</p>
          <ul className="mt-8 list-disc pl-20">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key} className="text-caption1r text-error">
                {error?.message as string}
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
