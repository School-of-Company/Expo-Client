import React, { ReactNode } from 'react';
import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { XMark } from '@/shared/assets/icons';
import { FormValues } from '@/shared/types/form/create/type';

interface OptionItemProps {
  optionId: string;
  icon?: ReactNode;
  optionIndex: number;
  questionIndex?: number;
  register: UseFormRegister<FormValues>;
  remove: (index: number) => void;
  inputName: `questions.${number}.options.${number}.value`;
  setValue?: UseFormSetValue<FormValues>;
  control?: Control<FormValues>;
}

const OptionItem = ({
  optionId,
  icon,
  optionIndex,
  questionIndex,
  register,
  remove,
  inputName,
  setValue,
  control,
}: OptionItemProps) => {
  const isAlwaysSelected =
    control && questionIndex !== undefined
      ? useWatch({
          control,
          name: `questions.${questionIndex}.options.${optionIndex}.isAlwaysSelected`,
          defaultValue: false,
        })
      : false;

  const toggleAlwaysSelected = () => {
    if (setValue && questionIndex !== undefined) {
      setValue(
        `questions.${questionIndex}.options.${optionIndex}.isAlwaysSelected`,
        !isAlwaysSelected,
      );
    }
  };

  return (
    <div key={optionId} className="flex w-full items-center justify-between">
      <div className="flex w-full items-center gap-10">
        <p className="text-body2b text-gray-500">{icon}</p>
        <input
          {...register(inputName, { required: '폼의 옵션을 입력해주세요' })}
          placeholder="문장을 입력해주세요."
          className="text-body4 w-[60%] text-black"
        />
        {control && setValue && questionIndex !== undefined && (
          <button
            type="button"
            onClick={toggleAlwaysSelected}
            className={`rounded px-8 py-4 text-caption2r ${
              isAlwaysSelected
                ? 'bg-main-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
            title="기본값"
          >
            기본값
          </button>
        )}
      </div>
      <button type="button" onClick={() => remove(optionIndex)}>
        <XMark />
      </button>
    </div>
  );
};

export default OptionItem;
