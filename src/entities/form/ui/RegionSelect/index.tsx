'use client';

import React from 'react';
import { ArrowDown } from '@/shared/assets/icons';
import { REGION_TREE, SIDO_LIST } from '../../constants/regionData';
import type { RegionValue } from '../../registry/region';

export const selectClassName =
  'w-full cursor-pointer appearance-none rounded-sm border-1 border-solid border-gray-200 bg-white py-12 pl-16 pr-40 text-body2r text-black outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';

/** 기본 화살표는 패딩이 안 먹어 테두리에 붙으므로 끄고 아이콘을 올린다(RegistrationSelect 와 같은 모양). */
export const SelectArrow = () => (
  <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 [&_svg]:h-16 [&_svg]:w-16">
    <ArrowDown />
  </span>
);

interface RegionSelectProps {
  value?: Partial<RegionValue>;
  onChange: (value: RegionValue) => void;
  onBlur?: () => void;
}

/** 시/도 → 시/군/구 2단계 선택. 시/도를 바꾸면 시/군/구를 비운다. 하위 단계가 없는 시/도는 두 번째 칸을 숨긴다. */
export default function RegionSelect({
  value,
  onChange,
  onBlur,
}: RegionSelectProps) {
  const sido = value?.sido ?? '';
  const sigungu = value?.sigungu ?? '';
  const children = REGION_TREE[sido];

  return (
    <div className="flex gap-8">
      <div className="relative flex-1">
        <select
          value={sido}
          onChange={(e) => onChange({ sido: e.target.value, sigungu: '' })}
          onBlur={onBlur}
          className={selectClassName}
          aria-label="시/도"
        >
          <option value="">시/도 선택</option>
          {SIDO_LIST.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <SelectArrow />
      </div>
      {children?.length !== 0 && (
        <div className="relative flex-1">
          <select
            value={sigungu}
            disabled={!children}
            onChange={(e) => onChange({ sido, sigungu: e.target.value })}
            onBlur={onBlur}
            className={selectClassName}
            aria-label="시/군/구"
          >
            <option value="">시/군/구 선택</option>
            {children?.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <SelectArrow />
        </div>
      )}
    </div>
  );
}
