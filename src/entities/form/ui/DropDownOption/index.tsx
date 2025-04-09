import React from 'react';
import { OptionProps } from '@/shared/types/form/create/type';
import OptionItem from '../OptionItem';
import OtherOption from '../OtherOptionProps';

const DropDownOption = ({
  fields,
  remove,
  register,
  index,
  isCheckBox,
}: OptionProps) => {
  return (
    <div className="space-y-10">
      {fields.map((option, optionIndex) => (
        <OptionItem
          key={option.id}
          icon={optionIndex + 1}
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

export default DropDownOption;
