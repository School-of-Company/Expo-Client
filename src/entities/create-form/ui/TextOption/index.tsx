import React from 'react';
import { XMark } from '@/shared/assets/icons';
import { OptionProps } from '@/shared/types/create-form/type';

const TextOption = ({
  fields,
  remove,
  register,
  index,
  isCheckBox,
}: OptionProps) => {
  return (
    <div className="space-y-2">
      {fields.map((option, optionIndex) => (
        <div
          key={option.id}
          className="flex w-full items-center justify-between"
        >
          <input
            {...register(`questions.${index}.options.${optionIndex}.value`)}
            placeholder="문장을 입력해주세요."
            className="w-[60%] text-body4 text-black"
          />
          <button type="button" onClick={() => remove(optionIndex)}>
            <XMark />
          </button>
        </div>
      ))}
      {isCheckBox ? (
        <div className="flex w-full items-center gap-[10px]">
          <p className="text-body4 text-black">기타</p>
          <p className="text-caption2 text-gray-300">(직접입력)</p>
        </div>
      ) : null}
    </div>
  );
};

export default TextOption;
