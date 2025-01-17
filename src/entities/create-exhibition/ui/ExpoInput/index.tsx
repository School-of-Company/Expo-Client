import React, { useState } from 'react';
import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { XMark } from '@/shared/assets/icons';
import AddButton from '@/shared/ui/AddItemButton';
import { ExhibitionFormData } from '@/widgets/create-exhibition/types/type';
import Modal from '../Modal';

interface Props {
  fields: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['fields'];
  append: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['append'];
  remove: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['remove'];
  register: UseFormRegister<ExhibitionFormData>;
  setValue: UseFormSetValue<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
  fieldName: 'trainings' | 'standard';
}

const ExpoInput = ({
  fields,
  append,
  remove,
  register,
  setValue,
  watch,
  fieldName,
}: Props) => {
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
      <AddButton
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
