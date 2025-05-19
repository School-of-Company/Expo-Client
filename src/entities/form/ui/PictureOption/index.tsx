import { FormPicture } from '@/shared/assets/icons';
import { OptionProps } from '@/shared/types/form/create/type';
import OptionItem from '../OptionItem';

const PictureOption = ({ fields, remove, register, index }: OptionProps) => {
  return (
    <div className="space-y-2">
      {fields.map((option, optionIndex) => (
        <OptionItem
          key={option.id}
          icon={<FormPicture width="16" height="16" />}
          optionId={option.id}
          optionIndex={optionIndex}
          register={register}
          remove={remove}
          inputName={`questions.${index}.options.${optionIndex}.value`}
        />
      ))}
    </div>
  );
};

export default PictureOption;
