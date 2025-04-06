import React from 'react';
import { Circle } from '@/shared/assets/svg';
import { OptionProps } from '@/shared/types/form/create/type';
import OptionItem from '../OptionItem';
import OtherOption from '../OtherOptionProps';

const MultipleChoiceOption = ({
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
          icon={<Circle />}
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

export default MultipleChoiceOption;
