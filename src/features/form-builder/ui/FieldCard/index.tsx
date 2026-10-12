'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BUILDER_FORM_TYPES,
  FormType,
  formTypeRegistry,
} from '@/entities/form';
import { ArrowDown, Trash, Warning } from '@/shared/assets/icons';
import { CheckedBoxIcon, Square } from '@/shared/assets/svg';
import { ToggleButton } from '@/shared/ui';
import ConditionalRuleEditor from '../ConditionalRuleEditor';
import type { FormBuilderVariant } from '../FormBuilder';
import type { DynamicFormItem } from '@/shared/types/application/type';
import type { DynamicFormType } from '@/shared/types/form/create/type';

const DYNAMIC_FORM_TYPES: {
  value: DynamicFormType | 'DEFAULT';
  label: string;
}[] = [
  { value: 'DEFAULT', label: '일반' },
  { value: 'NAME', label: '이름' },
  { value: 'PHONE_NUMBER', label: '전화번호' },
  { value: 'TRAINING_ID', label: '연수 번호' },
  { value: 'OCCUPATION', label: '직업' },
  { value: 'SCHOOL', label: '학교' },
];

const footerButton =
  'flex h-40 items-center gap-8 text-body2r text-gray-500 hover:text-black';

interface Props {
  list: readonly DynamicFormItem[];
  index: number;
  warnings?: string[];
  /** 드래그 중인 문항을 이 자리에 놓으면 이 문항의 조건이 깨진다. */
  willBreak?: boolean;
  variant: FormBuilderVariant;
  onChange: (item: DynamicFormItem) => void;
  onChangeType: (formType: FormType) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onAddOption: () => void;
  onRemoveOption: (key: string) => void;
}

const FieldCard = ({
  list,
  index,
  warnings = [],
  willBreak,
  variant,
  onChange,
  onChangeType,
  onRemove,
  onDuplicate,
  onAddOption,
  onRemoveOption,
}: Props) => {
  const item = list[index];
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const entry = formTypeRegistry[item.formType];
  const Editor = entry.Editor;
  const typeOptions = BUILDER_FORM_TYPES.includes(item.formType)
    ? BUILDER_FORM_TYPES
    : [item.formType, ...BUILDER_FORM_TYPES];
  const hasEtc = !!item.otherJson?.hasEtc;
  const showEtc = entry.supportsEtc && variant !== 'program';

  const border = willBreak
    ? 'border-dashed border-error'
    : warnings.length
      ? 'border-solid border-error'
      : 'border-solid border-gray-200';

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex list-none flex-col items-end gap-16 rounded-md border-1 bg-white px-24 py-16 mobile:px-16 ${border} ${
        isDragging ? 'z-10 opacity-80 shadow-lg' : ''
      }`}
    >
      <div className="flex w-full flex-col gap-20">
        <div className="flex w-full items-center gap-16 mobile:flex-wrap">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`${index + 1}번 문항 순서 변경`}
            className="-ml-8 shrink-0 cursor-grab touch-none rounded-sm p-4 text-gray-300 hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              {[3, 8, 13].flatMap((y) =>
                [5, 11].map((x) => (
                  <circle key={`${x}${y}`} cx={x} cy={y} r={1.5} />
                )),
              )}
            </svg>
          </button>
          <input
            value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })}
            placeholder="제목 입력"
            aria-label={`${index + 1}번 문항 제목`}
            className="min-w-0 flex-1 border-b-1 border-solid border-gray-100 py-14 text-h3b text-black placeholder:text-gray-500"
          />
          <div className="relative shrink-0 text-gray-500">
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2">
              {entry.icon}
            </span>
            <select
              value={item.formType}
              onChange={(e) => onChangeType(e.target.value as FormType)}
              aria-label="문항 타입"
              className="h-40 w-[200px] appearance-none truncate rounded-sm border-1 border-solid border-gray-100 bg-white pl-48 pr-40 text-body2r text-gray-500"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {formTypeRegistry[type].label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2">
              <ArrowDown fill="currentColor" />
            </span>
          </div>
        </div>

        {Editor && (
          <Editor
            item={item}
            onChange={onChange}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
          />
        )}

        <ConditionalRuleEditor list={list} index={index} onChange={onChange} />

        {warnings.length > 0 && (
          <ul role="alert" className="flex flex-col gap-4">
            {warnings.map((message) => (
              <li
                key={message}
                className="flex items-center gap-6 text-caption1r text-error [&_path]:fill-error [&_svg]:size-16"
              >
                <Warning />
                {message}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-20">
        {/* 특수 필드는 신청 폼에만 있다. 설문은 dynamicFormType이 없고, 프로그램 폼은 강제하지 않는다. */}
        {variant === 'application' && (
          <select
            value={item.dynamicFormType ?? 'DEFAULT'}
            onChange={(e) =>
              onChange({
                ...item,
                dynamicFormType: e.target.value as DynamicFormType | 'DEFAULT',
              })
            }
            aria-label="특수 필드"
            className="h-40 rounded-sm border-1 border-solid border-gray-100 bg-white px-12 text-body2r text-gray-500"
          >
            {DYNAMIC_FORM_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
        {showEtc && (
          <button
            type="button"
            aria-pressed={hasEtc}
            onClick={() =>
              onChange({
                ...item,
                otherJson: {
                  ...(item.otherJson ?? { hasEtc }),
                  hasEtc: !hasEtc,
                },
              })
            }
            className={`${footerButton} [&_svg]:size-20`}
          >
            {hasEtc ? <CheckedBoxIcon /> : <Square />}
            기타
          </button>
        )}
        <button type="button" onClick={onDuplicate} className={footerButton}>
          복제
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${index + 1}번 문항 삭제`}
          className="flex h-40 items-center gap-8 text-body2r text-error [&_svg]:size-20"
        >
          <Trash />
          버리기
        </button>
        <label className={footerButton}>
          필수
          <ToggleButton
            value={item.requiredStatus}
            disabled={!!item.otherJson?.conditional}
            onChange={(requiredStatus) => onChange({ ...item, requiredStatus })}
          />
        </label>
      </div>
    </li>
  );
};

export default FieldCard;
