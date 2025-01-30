import React, { ReactNode } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { XMark } from '@/shared/assets/icons';
import { FormValues } from '@/shared/types/create-form/type';

interface OptionItemProps {
  optionId: string;
  icon?: ReactNode;
  optionIndex: number;
  register: UseFormRegister<FormValues>;
  remove: (index: number) => void;
  inputName: `questions.${number}.options.${number}.value`;
}

const OptionItem = ({
  optionId,
  icon,
  optionIndex,
  register,
  remove,
  inputName,
}: OptionItemProps) => {
  return (
    <div key={optionId} className="flex w-full items-center justify-between">
      <div className="flex w-full items-center gap-[10px]">
        {icon}
        <input
          {...register(inputName, { required: '폼의 옵션을 입력해주세요' })}
          placeholder="문장을 입력해주세요."
          className="w-[60%] text-body4 text-black"
        />
      </div>
      <button type="button" onClick={() => remove(optionIndex)}>
        <XMark />
      </button>
    </div>
  );
};

export default OptionItem;
