import React from 'react';
import { Control, useController } from 'react-hook-form';
import { Check } from '@/shared/assets/icons';
import { FormValues } from '@/shared/types/create-form/type';

interface Props {
  control: Control<FormValues>;
  index: number;
  text: string;
}

const CheckBox = ({ control, index, text }: Props) => {
  const { field } = useController({
    name: `questions.${index}.otherJson`,
    control,
    defaultValue: null,
  });

  const toggleCheck = () => {
    field.onChange(field.value ? null : 'etc');
  };

  return (
    <button
      type="button"
      onClick={toggleCheck}
      className="flex items-center gap-2"
    >
      <div
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] border-2 border-solid ${
          field.value ? 'border-main-600' : 'border-gray-500'
        } bg-white`}
      >
        {field.value && <Check />}
      </div>
      <p
        className={`text-caption2 ${field.value ? 'text-main-600' : 'text-gray-500'}`}
      >
        {text}
      </p>
    </button>
  );
};

export default CheckBox;
