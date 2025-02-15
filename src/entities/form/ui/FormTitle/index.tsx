import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { FormValues } from '@/shared/types/form/create/type';

interface Props {
  index: number;
  register: UseFormRegister<FormValues>;
}

const FormTitle = ({ register, index }: Props) => {
  return (
    <div className="w-[60%] border-b-1 border-solid border-gray-100 py-4">
      <input
        {...register(`questions.${index}.title`, {
          required: `${index + 1}번 폼의 제목을 입력해주세요`,
        })}
        placeholder="제목 입력"
        className="w-full text-h4 text-black"
      />
    </div>
  );
};

export default FormTitle;
