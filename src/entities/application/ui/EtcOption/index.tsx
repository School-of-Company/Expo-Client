import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Props {
  type: 'radio' | 'checkbox';
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
  watch: UseFormWatch<ApplicationFormValues>;
  setValue: UseFormSetValue<ApplicationFormValues>;
  onCheckboxChange?: (isChecked: boolean) => void;
  selectedValues?: string[];
}

const EtcOption = ({
  type,
  register,
  name,
  watch,
  setValue,
  onCheckboxChange,
  selectedValues,
}: Props) => {
  const nameString = String(name);
  const etcTextName = `${nameString}-etc-text`;
  const currentValue = watch(nameString);

  const isEtcSelected =
    type === 'checkbox'
      ? (
          selectedValues || (Array.isArray(currentValue) ? currentValue : [])
        ).includes('기타')
      : currentValue === '기타';

  const etcTextValue = watch(etcTextName);
  const etcTextStringValue =
    typeof etcTextValue === 'string' ? etcTextValue : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'checkbox' && onCheckboxChange) {
      onCheckboxChange(e.target.checked);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(etcTextName, e.target.value);
  };

  const radioRegister = type === 'radio' ? register(nameString) : null;

  return (
    <div className="flex items-center gap-20">
      {type === 'checkbox' ? (
        <input
          id={`${name}-etc-option`}
          type="checkbox"
          className="h-16 w-16 accent-blue-500"
          value="기타"
          checked={isEtcSelected}
          onChange={handleInputChange}
        />
      ) : (
        <input
          id={`${name}-etc-option`}
          type="radio"
          className="h-16 w-16 accent-blue-500"
          value="기타"
          {...radioRegister}
        />
      )}
      {isEtcSelected ? (
        <input
          type="text"
          placeholder="직접 입력해주세요"
          className="flex-1 rounded-sm border-1 border-solid border-gray-300 px-12 py-8 text-body2r text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
          value={etcTextStringValue}
          onChange={handleTextChange}
        />
      ) : (
        <label
          htmlFor={`${name}-etc-option`}
          className="cursor-pointer text-body2r text-black"
        >
          기타
        </label>
      )}
    </div>
  );
};

export default EtcOption;
