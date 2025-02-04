import React from 'react';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Props {
  type: 'radio' | 'checkbox';
  register: UseFormRegister<ApplicationFormValues>;
  watch: UseFormWatch<ApplicationFormValues>;
  name: string;
}

const EtcOption = ({ type, register, watch, name }: Props) => {
  const watchedValue = watch(name);
  const isEtcSelected = Array.isArray(watchedValue)
    ? watchedValue.includes('etc')
    : watchedValue === 'etc';

  return (
    <div className="flex items-center gap-[10px]">
      <input type={type} value="etc" {...register(name)} />
      <label className="text-body3 text-black">기타</label>
      <input
        type="text"
        placeholder="(직접입력)"
        className={`text-body3 text-black ${isEtcSelected ? '' : 'bg-transparent'}`}
        {...register(`${name}_etc`, {
          required: isEtcSelected ? '기타를 입력해야 합니다.' : false,
        })}
        disabled={!isEtcSelected}
      />
    </div>
  );
};

export default EtcOption;
