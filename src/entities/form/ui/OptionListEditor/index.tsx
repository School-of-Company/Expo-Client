'use client';

import {
  FORM_TYPE_SPEC,
  isOptionsLocked,
  withOptionLabel,
} from '@/entities/form/model/formTypes';
import { Plus, XMark } from '@/shared/assets/icons';
import { Circle } from '@/shared/assets/svg';
import { COLORS } from '@/shared/config';
import type { DynamicFormItem } from '@/shared/types/application/type';

export interface FieldEditorProps {
  item: DynamicFormItem;
  onChange: (item: DynamicFormItem) => void;
  /** 선택지 삭제는 자식 조건까지 고쳐야 해서 목록 단위로 처리한다. */
  onRemoveOption: (key: string) => void;
  onAddOption: () => void;
}

const removeButtonClass =
  'shrink-0 disabled:opacity-40 [&_path]:fill-gray-500 hover:[&_path]:fill-black';

/** DROPDOWN·MULTIPLE 공용. 선택지 키는 고정하고 라벨만 바꾼다. */
const OptionListEditor = ({
  item,
  onChange,
  onRemoveOption,
  onAddOption,
}: FieldEditorProps) => {
  const spec = FORM_TYPE_SPEC[item.formType];
  const otherJson = item.otherJson ?? { hasEtc: false };
  const entries = Object.entries(item.jsonData);
  const numbered = item.formType === 'DROPDOWN';
  const locked = isOptionsLocked(item);

  const setOption = (key: string, label: string) =>
    onChange({
      ...item,
      jsonData: {
        ...item.jsonData,
        [key]: withOptionLabel(item.jsonData[key], label),
      },
    });

  const marker = (n: number) =>
    numbered ? (
      <span className="w-16 shrink-0 text-center text-body2b text-gray-500">
        {n}
      </span>
    ) : (
      <span className="shrink-0">
        <Circle />
      </span>
    );

  return (
    <div className="flex w-full flex-col gap-10">
      <ul className="flex flex-col gap-10">
        {entries.map(([key, option], i) => (
          <li key={key} className="flex items-center gap-10 py-4">
            {marker(i + 1)}
            <input
              value={typeof option === 'string' ? option : option.value}
              onChange={(e) => setOption(key, e.target.value)}
              placeholder="문장을 입력해주세요."
              aria-label={`선택지 ${i + 1}`}
              readOnly={locked}
              className="min-w-0 flex-1 border-b-1 border-solid border-gray-100 py-6 text-body2r text-black placeholder:text-gray-300 focus:border-main-600"
            />
            {!locked && (
              <button
                type="button"
                onClick={() => onRemoveOption(key)}
                disabled={entries.length <= 1}
                aria-label={`선택지 ${i + 1} 삭제`}
                className={removeButtonClass}
              >
                <XMark />
              </button>
            )}
          </li>
        ))}
        {otherJson.hasEtc && (
          <li className="flex items-center gap-10 py-4">
            {marker(entries.length + 1)}
            <p className="flex flex-1 items-center gap-10">
              <span className="text-body2r text-black">기타</span>
              <span className="text-caption1r text-gray-300">(직접입력)</span>
            </p>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...item,
                  otherJson: { ...otherJson, hasEtc: false },
                })
              }
              aria-label="기타 선택지 삭제"
              className={removeButtonClass}
            >
              <XMark />
            </button>
          </li>
        )}
      </ul>

      {!locked && (
        <button
          type="button"
          onClick={onAddOption}
          className="flex w-full items-center justify-center gap-8 rounded-sm border-1 border-solid border-gray-200 py-16 text-body1r text-main-600 hover:bg-main-100"
        >
          <Plus fill={COLORS.main600} />
          추가하기
        </button>
      )}

      {spec.supportsMaxSelection && (
        <label className="flex items-center justify-end gap-8 text-caption1r text-gray-500">
          최대 선택 개수
          <input
            type="number"
            min={1}
            max={entries.length}
            placeholder="제한 없음"
            value={otherJson.maxSelection ?? ''}
            onChange={(e) =>
              onChange({
                ...item,
                otherJson: {
                  ...otherJson,
                  // 1 이상의 정수만 받는다. -1, 0, 1.5 같은 값은 자른다.
                  maxSelection: e.target.value
                    ? Math.max(1, Math.floor(Number(e.target.value)))
                    : undefined,
                },
              })
            }
            className="w-[88px] rounded-sm border-1 border-solid border-gray-100 px-8 py-4 text-black placeholder:text-gray-300"
          />
        </label>
      )}
    </div>
  );
};

export default OptionListEditor;
