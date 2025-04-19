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

  const inputId = `${name}-etc-option`;

  return (
    <div className="flex items-center gap-20">
      <input
        id={inputId}
        type={type}
        className="h-16 w-16"
        value="etc"
        {...register(name)}
      />
      <div className="flex items-center gap-10">
        <label
          htmlFor={inputId}
          className="text-body3 cursor-pointer text-nowrap text-black"
        >
          기타
        </label>
        <input
          type="text"
          placeholder="(직접입력)"
          className={`text-body3 w-full min-w-10 text-black ${isEtcSelected ? '' : 'bg-transparent'}`}
          {...register(`${name}_etc`, {
            required: isEtcSelected ? '기타를 입력해야 합니다.' : false,
          })}
          disabled={!isEtcSelected}
        />
      </div>
    </div>
  );
};

export default EtcOption;
