import { UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';
import CheckBoxOption from '../CheckBoxOption';
import DropDownOption from '../DropDownOption';
import MultipleOption from '../MultipleOption';
import SentenceOption from '../SentenceOption';

const OptionContainer = ({
  title,
  formType,
  jsonData,
  register,
}: {
  title: string;
  formType: string;
  jsonData?: string;
  register: UseFormRegister<ApplicationFormValues>;
}) => {
  const options = jsonData
    ? Object.entries(JSON.parse(jsonData)).map(([key, value]) => ({
        value: key,
        label: value as string,
      }))
    : [];

  let inputComponent;
  switch (formType) {
    case 'SENTENCE':
      inputComponent = (
        <SentenceOption
          register={register}
          name={title}
          maxLength={1000}
          row={1}
          required={false}
        />
      );
      break;
    case 'CHECKBOX':
      inputComponent = (
        <CheckBoxOption options={options} register={register} name={title} />
      );
      break;
    case 'MULTIPLE':
      inputComponent = (
        <MultipleOption options={options} register={register} name={title} />
      );
      break;
    case 'DROPDOWN':
      inputComponent = (
        <DropDownOption options={options} register={register} name={title} />
      );
      break;
  }

  return (
    <div className="flex flex-col gap-[20px] rounded-sm border-1 border-solid border-gray-200 p-[18px]">
      <p className="text-h4 text-black">{title}</p>
      <div className="space-y-2">{inputComponent}</div>
    </div>
  );
};

export default OptionContainer;
