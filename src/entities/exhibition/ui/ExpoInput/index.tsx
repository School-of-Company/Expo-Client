import React, { useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import {
  DATE_TIME_PATTERN,
  isDateTimeRangeInvalid,
  isProgramTitleTooLong,
  PROGRAM_TITLE_MAX_LENGTH,
} from '@/shared/config/validation';
import { FieldArrayProps } from '@/shared/types/exhibition/type';
import { AddItemButton } from '@/shared/ui';
import Modal from '../Modal';

const ExpoInput = ({
  fields,
  append,
  remove,
  register,
  setValue,
  watch,
  fieldName,
}: FieldArrayProps) => {
  // 'new' 면 추가, 숫자면 그 항목 수정
  const [editing, setEditing] = useState<number | 'new' | null>(null);

  const items = watch(fieldName);

  const handleRemove = (index: number) => {
    // 박람회 수정은 목록 전체 교체라 저장된 프로그램을 빼면 서버에서 삭제된다
    if (
      items[index]?.id != null &&
      !window.confirm(
        `'${items[index].title}' 프로그램을 목록에서 뺄까요?\n저장하면 이 프로그램이 삭제됩니다. 신청 이력이 있는 프로그램은 삭제할 수 없습니다.`,
      )
    )
      return;
    remove(index);
  };

  return (
    <div className="relative flex flex-col gap-[20px]">
      {editing !== null && (
        <Modal
          fieldName={fieldName}
          initial={editing === 'new' ? undefined : items[editing]}
          onClose={() => setEditing(null)}
          onSubmit={(item) => {
            if (editing === 'new') append(item);
            else
              setValue(`${fieldName}.${editing}`, {
                ...items[editing],
                ...item,
              });
            setEditing(null);
          }}
        />
      )}
      {fields.length > 0 && (
        <div className="flex flex-col gap-12">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-between gap-8"
            >
              <div className="flex min-w-0 flex-1 items-center gap-6">
                <p className="text-body4 flex-shrink-0 text-gray-500">
                  {index + 1}
                </p>
                {/* 제목은 입력칸이 아니라 글자로 보여 준다. append 직후 첫 렌더에서도 field 값으로 채워진다 */}
                <input
                  type="hidden"
                  {...register(`${fieldName}.${index}.title`, {
                    required: '연수를 입력해주세요',
                    validate: (title) =>
                      !isProgramTitleTooLong(title) ||
                      `프로그램명은 ${PROGRAM_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
                  })}
                />
                <p className="text-body4 min-w-0 flex-1 truncate text-gray-500">
                  {items[index]?.title || field.title}
                </p>
                <input
                  type="hidden"
                  {...register(`${fieldName}.${index}.startedAt`, {
                    required: '연수 시작 일과 시간을 입력해주세요.',
                    pattern: DATE_TIME_PATTERN,
                  })}
                />
                <input
                  type="hidden"
                  {...register(`${fieldName}.${index}.endedAt`, {
                    required: '연수 종료 일과 시간을 입력해주세요.',
                    pattern: DATE_TIME_PATTERN,
                    validate: (endedAt, formValues) =>
                      !isDateTimeRangeInvalid(
                        formValues[fieldName][index]?.startedAt ?? '',
                        endedAt,
                      ) || '프로그램 종료 일시는 시작 일시보다 늦어야 합니다.',
                  })}
                />
              </div>
              <div className="flex flex-shrink-0 gap-7 mobile:gap-3">
                <button
                  onClick={() => setEditing(index)}
                  type="button"
                  className="rounded-sm border-1 border-solid border-gray-200 px-3 py-1 text-body2r text-gray-300"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="hover:cursor-pointer"
                >
                  <XMark />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddItemButton onClick={() => setEditing('new')} />
    </div>
  );
};

export default ExpoInput;
