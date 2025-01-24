import React, { useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { FieldArrayProps } from '@/shared/types/create-exhibition/type';
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

  const handleRemove = (index: number) => {
    remove(index);
    setSelectedIndex(null);
    setModal(false);
  };

  const items = watch(fieldName);

  return (
    <div className="relative flex flex-col gap-[20px]">
      {modal && selectedIndex !== null && (
        <Modal
          setModal={setModal}
          register={register}
          setValue={setValue}
          index={selectedIndex}
          watch={watch}
          fieldName={fieldName}
        />
      )}
      {fields.length > 0 && (
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center justify-between">
              <div className="flex flex-grow items-center gap-6">
                <p className="text-body4 text-gray-500">{index + 1}</p>
                <input
                  {...register(`${fieldName}.${index}.title` as const, {
                    required: '연수를 입력해주세요',
                  })}
                  placeholder="연수를 입력해주세요"
                  className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap bg-transparent text-body4 text-gray-500"
                  value={items[index]?.title || ''}
                  onChange={(e) =>
                    setValue(
                      `${fieldName}.${index}.title` as const,
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="flex gap-7 mobile:gap-3">
                <button
                  onClick={() => handleTrainingModal(index)}
                  type="button"
                  className="rounded-sm border-1 border-solid border-gray-200 px-2 py-1 text-body4 text-gray-300"
                >
                  수정 하기
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
