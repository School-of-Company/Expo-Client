'use client';

import React from 'react';
import { useController } from 'react-hook-form';
import {
  RegionSelect,
  regionModel,
  type FieldRendererProps,
} from '@/entities/form';

/** RHF에 묶인 지역 선택. 지역 문항과 동행자의 지역 칸이 같이 쓴다. */
export default function RegionInput({
  name,
  control,
  item,
}: FieldRendererProps) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: {
      validate: (value) => regionModel.validate(value, item),
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <RegionSelect
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
      {fieldState.error?.message && (
        <span className="text-caption1r text-error">
          {fieldState.error.message}
        </span>
      )}
    </div>
  );
}
