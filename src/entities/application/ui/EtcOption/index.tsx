import { UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Props {
  type: 'radio' | 'checkbox';
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
}

const EtcOption = ({ type, register, name }: Props) => {
  const inputId = `${name}-etc-option`;

  return (
    <div className="flex items-center gap-20">
      <input
        id={inputId}
        type={type}
        className="h-16 w-16"
        value="기타"
        {...register(name)}
      />
      <label
        htmlFor={inputId}
        className="text-body3 cursor-pointer text-nowrap text-black"
      >
        기타
      </label>
    </div>
  );
};

export default EtcOption;
