import { UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Props {
  type: 'radio' | 'checkbox';
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
}

const EtcOption = ({ type, register, name }: Props) => {
  return (
    <div className="flex items-center gap-[10px]">
      <input type={type} value="etc" {...register(name)} />
      <label className="text-body3 text-black">기타</label>
      <input
        type="text"
        placeholder="(직접입력)"
        className="text-body3 text-black"
      />
    </div>
  );
};

export default EtcOption;
