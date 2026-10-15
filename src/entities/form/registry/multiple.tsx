'use client';

import {
  alwaysSelectedKeys,
  ETC_KEY,
  optionEntries,
  resolveEtc,
  type FieldDefinition,
  type FieldRendererProps,
} from './model';

const toArray = (value: unknown) =>
  Array.isArray(value) ? (value as string[]) : [];

function MultipleRenderer({
  item,
  value,
  etc,
  onChange,
  onEtcChange,
}: FieldRendererProps) {
  const selected = toArray(value);
  const maxSelection = item.otherJson?.maxSelection;
  const isMaxReached = !!maxSelection && selected.length >= maxSelection;
  const options = [
    ...optionEntries(item),
    ...(item.otherJson?.hasEtc
      ? [{ key: ETC_KEY, label: '기타', isAlwaysSelected: false }]
      : []),
  ];

  const toggle = (key: string, checked: boolean) =>
    onChange(checked ? [...selected, key] : selected.filter((v) => v !== key));

  return (
    <div className="flex flex-col gap-10">
      {options.map(({ key, label, isAlwaysSelected }) => {
        const inputId = `${item.id}-${key}`;
        const checked = isAlwaysSelected || selected.includes(key);
        const disabled = isAlwaysSelected || (isMaxReached && !checked);
        return (
          <div key={key} className="flex items-center gap-20">
            <input
              id={inputId}
              type="checkbox"
              className="h-16 w-16 accent-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              checked={checked}
              disabled={disabled}
              onChange={(e) => toggle(key, e.target.checked)}
            />
            <label
              htmlFor={inputId}
              className={`text-body2r ${disabled && !checked ? 'text-gray-700' : 'cursor-pointer text-black'}`}
            >
              {label}
            </label>
          </div>
        );
      })}
      {selected.includes(ETC_KEY) && (
        <input
          className="w-full border-b-1 border-solid border-gray-100 bg-transparent text-body2r text-black"
          placeholder="기타 내용을 입력해주세요"
          maxLength={100}
          value={etc}
          onChange={(e) => onEtcChange(e.target.value)}
        />
      )}
      {!!maxSelection && (
        <p className="text-caption1r text-gray-500">
          * 최대 {maxSelection}개까지 선택 가능합니다
        </p>
      )}
    </div>
  );
}

export const multipleField: FieldDefinition = {
  Renderer: MultipleRenderer,
  defaultValue: (item) => alwaysSelectedKeys(item),
  validate: (item, value, etc) => {
    const selected = toArray(value);
    const maxSelection = item.otherJson?.maxSelection;
    if (alwaysSelectedKeys(item).some((key) => !selected.includes(key))) {
      return '고정된 선택지는 해제할 수 없습니다';
    }
    if (selected.length === 0) {
      return item.requiredStatus ? '하나 이상 선택해주세요' : undefined;
    }
    if (maxSelection && selected.length > maxSelection) {
      return `최대 ${maxSelection}개까지 선택 가능합니다`;
    }
    if (selected.includes(ETC_KEY) && !etc.trim()) {
      return '기타 내용을 입력해주세요';
    }
  },
  toAnswer: (item, value, etc) => {
    const always = alwaysSelectedKeys(item);
    const keys = [
      ...always,
      ...toArray(value).filter((key) => !always.includes(key)),
    ]
      .map((key) => resolveEtc(key, etc))
      .filter(Boolean);
    return keys.length > 0 ? keys : undefined;
  },
};
