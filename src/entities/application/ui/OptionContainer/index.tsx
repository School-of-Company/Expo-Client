import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';
import ApplicationPhoneOption from '../ApplicationPhoneOption';
import CheckBoxOption from '../CheckBoxOption';
import DropDownOption from '../DropDownOption';
import MultipleOption from '../MultipleOption';
import SentenceOption from '../SentenceOption';

const OptionContainer = ({
  title,
  formType,
  jsonData,
  requiredStatus,
  otherJson,
  register,
  watch,
  setValue,
}: {
  title: string;
  formType: string;
  jsonData?: string | { [key: string]: string };
  requiredStatus: boolean;
  otherJson: string | null;
  register: UseFormRegister<ApplicationFormValues>;
  watch: UseFormWatch<ApplicationFormValues>;
  setValue: UseFormSetValue<ApplicationFormValues>;
}) => {
  const options = jsonData
    ? typeof jsonData === 'string'
      ? Object.entries(JSON.parse(jsonData)).map(([key, value]) => ({
          value: key,
          label: value as string,
        }))
      : Object.entries(jsonData).map(([key, value]) => ({
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
          maxLength={10}
          row={1}
          required={requiredStatus}
        />
      );
      break;
    case 'CHECKBOX':
      inputComponent = (
        <CheckBoxOption
          options={options}
          register={register}
          name={title}
          required={requiredStatus}
          otherJson={otherJson}
          watch={watch}
        />
      );
      break;
    case 'MULTIPLE':
      inputComponent = (
        <MultipleOption
          options={options}
          register={register}
          name={title}
          required={requiredStatus}
          otherJson={otherJson}
          watch={watch}
        />
      );
      break;
    case 'DROPDOWN':
      inputComponent = (
        <DropDownOption
          options={options}
          register={register}
          name={title}
          required={requiredStatus}
          setValue={setValue}
        />
      );
      break;
    case 'APPLICATIONPHONEOPTION':
      inputComponent = (
        <ApplicationPhoneOption
          register={register}
          name={title}
          maxLength={20}
          row={1}
          required={requiredStatus}
          watch={watch}
          setValue={setValue}
        />
      );
  }

  return (
    <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
      <div className="flex items-center gap-2">
        <p className="text-h3b text-black">{title}</p>
        {requiredStatus ? <p className="text-main-600">*</p> : null}
      </div>
      <div className="space-y-10">{inputComponent}</div>
    </div>
  );
};

export default OptionContainer;
