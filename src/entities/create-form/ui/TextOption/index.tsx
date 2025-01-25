import React from 'react';
import { OptionProps } from '@/shared/types/create-form/type';
import OptionItem from '../OptionItem';
import OtherOption from '../OtherOptionProps';

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
        <OptionItem
          key={option.id}
          optionId={option.id}
          optionIndex={optionIndex}
          register={register}
          remove={remove}
          inputName={`questions.${index}.options.${optionIndex}.value`}
        />
      ))}
      {isCheckBox ? <OtherOption text="기타" /> : null}
    </div>
  );
};

export default TextOption;
