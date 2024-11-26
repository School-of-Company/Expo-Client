import React, { useState } from 'react';
import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Plus, XMark } from '@/shared/assets/icons';
import { ExhibitionFormData } from '@/widgets/create-exhibition/types/type';
import Modal from '../Modal';

interface Props {
  fields: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['fields'];
  append: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['append'];
  remove: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['remove'];
  register: UseFormRegister<ExhibitionFormData>;
  setValue: UseFormSetValue<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
}

const ExpoInput = ({
  fields,
  append,
  remove,
  register,
  setValue,
  watch,
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

  const trainings = watch('trainings');

  return (
    <div className="relative flex flex-col gap-[20px]">
      {modal && selectedIndex !== null && (
        <Modal
          setModal={setModal}
          register={register}
          setValue={setValue}
          index={selectedIndex}
          watch={watch}
        />
      )}
      {fields.length > 0 && (
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center justify-between">
              <div className="flex flex-grow items-center gap-6">
                <p className="text-body4 text-gray-500">{index + 1}</p>
                <input
                  {...register(`trainings.${index}.title`)}
                  placeholder="연수를 입력해주세요"
                  className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap bg-transparent text-body4 text-gray-500"
                  value={trainings[index]?.title || ''}
                  onChange={(e) =>
                    setValue(`trainings.${index}.title`, e.target.value)
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
      <button
        type="button"
        className="mx-auto flex items-center gap-5"
        onClick={() =>
          append({ title: '', startedAt: '', endedAt: '', category: 'CHOICE' })
        }
      >
        <Plus fill="#448FFF" />
        <div className="text-body3 text-main-600">추가하기</div>
      </button>
    </div>
  );
};

export default ExpoInput;
