import React from 'react';
import { XMark } from '@/shared/assets/icons';
import { OptionProps } from '@/shared/types/create-form/type';

const DropDownOption = ({ fields, remove, register, index }: OptionProps) => {
  return (
    <div className="space-y-2">
      {fields.map((option, optionIndex) => (
        <div
          key={option.id}
          className="flex w-full items-center justify-between"
        >
          <div className="flex w-full items-center gap-[10px]">
            <p className="text-body3 text-gray-500">1</p>
            <input
              {...register(`questions.${index}.options.${optionIndex}.value`)}
              placeholder="문장을 입력해주세요."
              className="w-[60%] text-body4 text-black"
            />
          </div>
          <button type="button" onClick={() => remove(optionIndex)}>
            <XMark />
          </button>
        </div>
      ))}
    </div>
  );
};

export default DropDownOption;
