'use client';

import { ArrowDown } from '@/shared/assets/icons';
import {
  alwaysSelectedKeys,
  ETC_KEY,
  optionEntries,
  resolveEtc,
  type FieldDefinition,
  type FieldRendererProps,
} from './model';

function DropdownRenderer({
  item,
  value,
  etc,
  onChange,
  onEtcChange,
}: FieldRendererProps) {
  const selected = typeof value === 'string' ? value : '';
  // 항상 선택 선택지가 있으면 그 값으로 고정한다.
  const locked = alwaysSelectedKeys(item).length > 0;

  return (
    <div className="flex flex-col gap-12">
      {/* 기본 화살표는 위치를 못 옮겨서 숨기고 아이콘을 직접 둔다. */}
      <div className="relative w-fit">
        <select
          className="w-fit appearance-none rounded-sm border-1 border-solid border-gray-100 bg-white py-12 pl-16 pr-48 text-body2r text-black disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={item.title}
          value={selected}
          disabled={locked}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            선택해주세요
          </option>
          {optionEntries(item).map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
          {item.otherJson?.hasEtc && <option value={ETC_KEY}>기타</option>}
        </select>
        <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 [&_svg]:h-16 [&_svg]:w-16">
          <ArrowDown />
        </span>
      </div>
      {selected === ETC_KEY && (
        <input
          className="w-full border-b-1 border-solid border-gray-100 bg-transparent text-body2r text-black"
          placeholder="기타 내용을 입력해주세요"
          maxLength={100}
          value={etc}
          onChange={(e) => onEtcChange(e.target.value)}
        />
      )}
    </div>
  );
}

export const dropdownField: FieldDefinition = {
  Renderer: DropdownRenderer,
  defaultValue: (item) => alwaysSelectedKeys(item)[0] ?? '',
  validate: (item, value, etc) => {
    const selected = typeof value === 'string' ? value : '';
    const always = alwaysSelectedKeys(item)[0];
    if (always && selected !== always)
      return '고정된 선택지는 바꿀 수 없습니다';
    if (!selected) return item.requiredStatus ? '선택해주세요' : undefined;
    if (selected === ETC_KEY && !etc.trim()) return '기타 내용을 입력해주세요';
  },
  toAnswer: (item, value, etc) => {
    const always = alwaysSelectedKeys(item)[0];
    if (always) return always;
    return typeof value === 'string'
      ? resolveEtc(value, etc) || undefined
      : undefined;
  },
};
