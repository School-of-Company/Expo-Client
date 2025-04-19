import React from 'react';
import { Control, useController } from 'react-hook-form';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import { FormValues } from '@/shared/types/form/create/type';

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
      className="flex items-center gap-8"
    >
      {field.value ? <CheckedBoxIcon /> : <CheckBoxIcon />}
      <p
        className={`text-caption1r mobile:text-caption2r ${field.value ? 'text-main-600' : 'text-gray-500'}`}
      >
        {text}
      </p>
    </button>
  );
};

export default CheckBox;
