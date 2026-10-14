'use client';

import { ArrowDown } from '@/shared/assets/icons';
import { REGION_OPTIONS } from '../constants/occupationData';
import type { FieldDefinition, FieldRendererProps } from './model';

/** 서버 `Region` enum 키인지. 선택지는 고정이라 `jsonData`를 쓰지 않는다. */
export const isRegion = (value: unknown): value is string =>
  REGION_OPTIONS.some(({ key }) => key === value);

/** 지역 선택. 화면 이름("광주")은 클라이언트가 정하고 값은 enum 키(`GWANGJU`)다. */
export function RegionSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-fit">
      <select
        className="w-fit appearance-none rounded-sm border-1 border-solid border-gray-100 bg-white py-12 pl-16 pr-48 text-body2r text-black"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          지역 선택
        </option>
        {REGION_OPTIONS.map(({ key, label: optionLabel }) => (
          <option key={key} value={key}>
            {optionLabel}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 [&_svg]:h-16 [&_svg]:w-16">
        <ArrowDown />
      </span>
    </div>
  );
}

function RegionRenderer({ item, value, onChange }: FieldRendererProps) {
  return (
    <RegionSelect
      label={item.title}
      value={typeof value === 'string' ? value : ''}
      onChange={onChange}
    />
  );
}

export const regionField: FieldDefinition = {
  Renderer: RegionRenderer,
  defaultValue: () => '',
  validate: (item, value) => {
    if (!value) return item.requiredStatus ? '지역을 선택해주세요' : undefined;
    if (!isRegion(value)) return '지역을 다시 선택해주세요';
  },
  toAnswer: (_item, value) => (isRegion(value) ? value : undefined),
};
