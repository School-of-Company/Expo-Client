import { Control, UseFormSetValue } from 'react-hook-form';
import { Square } from '@/shared/assets/svg';
import { FormValues, OptionProps } from '@/shared/types/form/create/type';
import OptionItem from '../OptionItem';
import OtherOption from '../OtherOptionProps';

interface CheckBoxOptionProps extends OptionProps {
  setValue: UseFormSetValue<FormValues>;
  control: Control<FormValues>;
}

const CheckBoxOption = ({
  fields,
  remove,
  register,
  index,
  isCheckBox,
  setValue,
  control,
}: CheckBoxOptionProps) => {
  return (
    <div className="space-y-10">
      {fields.map((option, optionIndex) => (
        <OptionItem
          key={option.id}
          icon={<Square />}
          optionId={option.id}
          optionIndex={optionIndex}
          questionIndex={index}
          register={register}
          remove={remove}
          inputName={`questions.${index}.options.${optionIndex}.value`}
          setValue={setValue}
          control={control}
        />
      ))}
      {isCheckBox ? <OtherOption text="기타" /> : null}
    </div>
  );
};

export default CheckBoxOption;
