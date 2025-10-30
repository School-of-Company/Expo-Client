import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { slugify } from '@/shared/model';
import { ApplicationFormValues } from '@/shared/types/application/type';
import { ConditionalSettings } from '@/shared/types/form/create/type';
import ApplicationPhoneOption from '../ApplicationPhoneOption';
import CheckBoxOption from '../CheckBoxOption';
import DropDownOption from '../DropDownOption';
import MultipleOption from '../MultipleOption';
import SentenceOption from '../SentenceOption';

interface OptionContainerProps {
  title: string;
  formType: string;
  jsonData?: string | { [key: string]: string };
  requiredStatus: boolean;
  otherJson: string | null;
  type?: string;
  register: UseFormRegister<ApplicationFormValues>;
  watch: UseFormWatch<ApplicationFormValues>;
  setValue: UseFormSetValue<ApplicationFormValues>;
  readOnly?: boolean;
  defaultValue?: string;
  warningMessage?: string | null;
}

const parseOtherJson = (otherJson: string | null): boolean => {
  if (!otherJson) return false;

  try {
    const parsed: ConditionalSettings = JSON.parse(otherJson);
    return parsed.hasEtc || false;
  } catch {
    return otherJson === 'etc';
  }
};

const OptionContainer = ({
  title,
  formType,
  jsonData,
  requiredStatus,
  otherJson,
  type = 'text',
  register,
  watch,
  setValue,
  readOnly = false,
  defaultValue = '',
  warningMessage,
}: OptionContainerProps) => {
  const safeName = slugify(title);

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

  const hasEtc = parseOtherJson(otherJson);

  let inputComponent;
  switch (formType) {
    case 'SENTENCE':
      inputComponent = (
        <SentenceOption
          register={register}
          name={safeName}
          maxLength={500}
          row={1}
          required={requiredStatus}
          type={type}
          readOnly={readOnly}
          defaultValue={defaultValue}
          warningMessage={warningMessage}
        />
      );
      break;
    case 'CHECKBOX':
      inputComponent = (
        <CheckBoxOption
          options={options}
          register={register}
          name={safeName}
          required={requiredStatus}
          otherJson={hasEtc ? 'etc' : null}
        />
      );
      break;
    case 'MULTIPLE':
      inputComponent = (
        <MultipleOption
          options={options}
          register={register}
          name={safeName}
          required={requiredStatus}
          otherJson={hasEtc ? 'etc' : null}
        />
      );
      break;
    case 'DROPDOWN':
      inputComponent = (
        <DropDownOption
          options={options}
          register={register}
          name={safeName}
          required={requiredStatus}
          setValue={setValue}
        />
      );
      break;
    case 'APPLICATIONPHONEOPTION':
      inputComponent = (
        <ApplicationPhoneOption
          register={register}
          name={safeName}
          maxLength={20}
          row={1}
          required={requiredStatus}
          watch={watch}
          setValue={setValue}
          type={type}
          warningMessage={warningMessage}
        />
      );
      break;
    default:
      inputComponent = null;
  }

  return (
    <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
      <div className="flex items-center gap-2">
        <p className="text-h3b text-black">{title}</p>
        {requiredStatus && <p className="text-main-600">*</p>}
      </div>
      <div className="space-y-10">{inputComponent}</div>
    </div>
  );
};

export default OptionContainer;
