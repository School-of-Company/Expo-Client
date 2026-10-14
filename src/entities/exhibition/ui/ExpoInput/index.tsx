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
  const [modal, setModal] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleTrainingModal = (index: number) => {
    setSelectedIndex(index);
    setModal(true);
  };

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
    setSelectedIndex(null);
    setModal(false);
  };

  return (
    <div className="relative flex flex-col gap-[20px]">
      {modal && selectedIndex !== null && (
        <Modal
          setModal={setModal}
          setValue={setValue}
          index={selectedIndex}
          watch={watch}
          fieldName={fieldName}
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
                <div className="min-w-0 flex-1">
                  <input
                    {...register(`${fieldName}.${index}.title`, {
                      required: '연수를 입력해주세요',
                      validate: (title) =>
                        !isProgramTitleTooLong(title) ||
                        `프로그램명은 ${PROGRAM_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
                    })}
                    placeholder="연수를 입력해주세요"
                    className="text-body4 w-full overflow-hidden overflow-ellipsis whitespace-nowrap bg-transparent text-gray-500"
                    value={items[index]?.title || ''}
                    onChange={(e) =>
                      setValue(`${fieldName}.${index}.title`, e.target.value)
                    }
                  />
                </div>
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
                  onClick={() => handleTrainingModal(index)}
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
      <AddItemButton
        onClick={() =>
          append({
            title: '',
            startedAt: '',
            endedAt: '',
            ...(fieldName === 'trainings' ? { category: 'CHOICE' } : {}),
          })
        }
      />
    </div>
  );
};

export default ExpoInput;
