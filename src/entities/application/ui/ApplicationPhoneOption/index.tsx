import React, { useEffect, useRef } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Props {
  maxLength: number;
  row: number;
  required: boolean;
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
  type: string;
  setValue: UseFormSetValue<ApplicationFormValues>;
  watch: UseFormWatch<ApplicationFormValues>;
}

export default function ApplicationPhoneOption({
  maxLength,
  row,
  required,
  register,
  name,
  type,
  setValue,
  watch,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const phoneNumberStatus = watch('phoneNumberStatus');

  const { ref, onChange, ...rest } = register(name, {
    required:
      required && phoneNumberStatus === 'true'
        ? '필수 옵션을 작성해주세요'
        : false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    let value = e.target.value;

    // ✅ 숫자 타입일 경우 숫자만 허용
    if (type === 'number') {
      value = value.replace(/[^0-9]/g, '');
      e.target.value = value; // react-hook-form에서 사용하는 값도 업데이트
    }

    if (onChange) {
      onChange(e);
    }
  };

  useEffect(() => {
    if (phoneNumberStatus === 'false') {
      setValue(name, '', { shouldValidate: true });
    }
  }, [phoneNumberStatus, setValue, name]);

  return (
    <div className="relative flex flex-col gap-20">
      <label className="flex cursor-pointer items-center gap-20">
        <input
          type="radio"
          value="false"
          {...register('phoneNumberStatus', {
            required: required ? '전화번호 여부를 선택해주세요' : false,
          })}
          className="h-16 w-16 accent-blue-500"
        />
        <span className="text-body2r text-black">전화번호 여부 X</span>
      </label>
      <label className="flex cursor-pointer items-center gap-20">
        <input
          type="radio"
          value="true"
          {...register('phoneNumberStatus', {
            required: required ? '전화번호 여부를 선택해주세요' : false,
          })}
          className="h-16 w-16 accent-blue-500"
        />
        <span className="text-body2r text-black">전화번호 여부 O</span>
      </label>

      {phoneNumberStatus === 'true' && (
        <div className="space-y-8">
          <div className="relative">
            <textarea
              ref={(el) => {
                textareaRef.current = el;
                ref(el);
              }}
              className="w-full resize-none overflow-hidden bg-transparent text-body2r text-black"
              rows={row}
              maxLength={maxLength}
              onChange={handleChange}
              placeholder={name}
              {...rest}
            />
          </div>
          <hr className="border-gray-100" />
        </div>
      )}
    </div>
  );
}
