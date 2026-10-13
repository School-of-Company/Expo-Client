'use client';

import React from 'react';
import {
  CompanionField,
  companionCountRange,
  companionModel,
  type CompanionValue,
  type FieldRendererProps,
} from '@/entities/form';
import { RegionInput } from '../../region';

/** 동행자 목록. 기존 `CompanionField`에 2단계 지역 선택과 인원·항목 검사를 끼운다. */
export default function CompanionRenderer({
  item,
  name,
  control,
}: FieldRendererProps) {
  // 동행자마다 지역은 필수다.
  const regionItem = { ...item, requiredStatus: true };

  return (
    <CompanionField
      name={name}
      label={item.title}
      required={item.requiredStatus}
      maxCount={companionCountRange(item).max}
      control={control}
      register={control.register}
      validate={(value) =>
        companionModel.validate(value as CompanionValue[] | undefined, item)
      }
      renderRegion={(path) => (
        <RegionInput name={path} control={control} item={regionItem} />
      )}
    />
  );
}
