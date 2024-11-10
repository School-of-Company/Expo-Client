import React from 'react';
import { UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { Plus, XMark } from '@/shared/assets/icons';
import { ExhibitionFormData } from '@/widgets/create-exhibition/types/type';

interface Props {
  fields: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['fields'];
  append: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['append'];
  remove: UseFieldArrayReturn<ExhibitionFormData, 'trainings', 'id'>['remove'];
  register: UseFormRegister<ExhibitionFormData>;
}

const ExpoInput = ({ fields, append, remove, register }: Props) => {
  return (
    <div className="flex flex-col gap-[20px]">
      {fields.length > 0 && (
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center justify-between">
              <div className="flex flex-grow items-center gap-6">
                <p className="text-body4 text-gray-500">{index + 1}</p>
                <input
                  {...register(`trainings.${index}.name`)}
                  placeholder="연수를 입력해주세요"
                  className="w-full bg-transparent text-body4 text-gray-500"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="hover:cursor-pointer"
              >
                <XMark />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="mx-auto flex items-center gap-5"
        onClick={() => append({ name: '' })}
      >
        <Plus fill="#448FFF" />
        <div className="text-body3 text-main-600">추가하기</div>
      </button>
    </div>
  );
};

export default ExpoInput;
