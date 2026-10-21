'use client';

import React, { useEffect, useRef } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldValues,
} from 'react-hook-form';

interface PhoneFieldProps {
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  warningMessage?: string | null;
  /** 휴대폰 인증한 번호. 있으면 이 번호를 보여 주기만 하고 고칠 수 없다(서버는 인증한 번호로 저장한다) */
  lockedValue?: string;
}

export default function PhoneField({
  name,
  label,
  required = false,
  maxLength = 20,
  register,
  setValue,
  watch,
  warningMessage,
  lockedValue,
}: PhoneFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const phoneStatusFieldName = `${name}_status`;
  const phoneNumberStatus = watch(phoneStatusFieldName);

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
    value = value.replace(/[^0-9]/g, '');
    e.target.value = value;

    if (onChange) {
      onChange(e);
    }
  };

  useEffect(() => {
    if (phoneNumberStatus === 'false') {
      setValue(name, '', { shouldValidate: true });
    }
  }, [phoneNumberStatus, setValue, name]);

  if (lockedValue)
    return (
      <div className="flex flex-col gap-8">
        <input
          type="text"
          value={lockedValue}
          readOnly
          aria-label={label}
          className="w-full bg-transparent text-body2r text-gray-600"
        />
        <hr className="border-gray-100" />
        <p className="text-caption1r text-gray-500">
          휴대폰 인증한 번호로 신청합니다. 번호를 바꾸려면 다시 인증해주세요.
        </p>
      </div>
    );

  return (
    <div className="relative flex flex-col gap-20">
      <label className="flex cursor-pointer items-center gap-20">
        <input
          type="radio"
          value="false"
          {...register(phoneStatusFieldName, {
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
          {...register(phoneStatusFieldName, {
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
              rows={1}
              maxLength={maxLength}
              onChange={handleChange}
              placeholder={label}
              {...rest}
            />
          </div>
          <hr className="border-gray-100" />
        </div>
      )}
      {warningMessage && (
        <p className="whitespace-pre-line text-body2r text-error mobile:text-caption2r">
          {warningMessage}
        </p>
      )}
    </div>
  );
}
