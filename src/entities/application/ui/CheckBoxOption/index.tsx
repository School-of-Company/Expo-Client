import { UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
}

const CheckBoxOption = ({ options, register, name }: Props) => {
  return (
    <div>
      {options.map((option) => (
        <div key={option.value} className="mb-2 flex items-center">
          <input
            type="checkbox"
            value={option.label}
            className="h-4 w-4 accent-blue-500"
            {...register(name)}
          />
          <label className="ml-2 text-sm">{option.label}</label>
        </div>
      ))}
    </div>
  );
};

export default CheckBoxOption;
