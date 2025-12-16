'use client';

import React, { useEffect, useRef } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldValues,
} from 'react-hook-form';

interface EtcFieldProps {
  name: string;
  type: 'radio' | 'checkbox';
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  label?: string;
  onCheckboxChange?: (isChecked: boolean) => void;
  selectedValues?: string[];
}

export default function EtcField({
  name,
  type,
  register,
  watch,
  setValue,
  label = '기타',
  onCheckboxChange,
  selectedValues = [],
}: EtcFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const etcFieldName = `${name}_etc`;
  const etcCheckedFieldName = `${name}_etc_checked`;

  const selectedValue = watch(name);
  const isEtcSelected =
    type === 'radio' ? selectedValue === label : selectedValues.includes(label);

  const { ref: registerRef, ...restRegister } = register(etcFieldName);

  const handleRadioChange = () => {
    setValue(name, label);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setValue(etcCheckedFieldName, isChecked);
    if (onCheckboxChange) {
      onCheckboxChange(isChecked);
    }
    if (!isChecked) {
      setValue(etcFieldName, '');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    restRegister.onChange(e);
  };

  useEffect(() => {
    if (type === 'radio' && selectedValue !== label) {
      setValue(etcFieldName, '');
    }
  }, [selectedValue, label, setValue, etcFieldName, type]);

  useEffect(() => {
    if (type === 'checkbox' && !isEtcSelected) {
      setValue(etcFieldName, '');
    }
  }, [isEtcSelected, setValue, etcFieldName, type]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-20">
        {type === 'radio' ? (
          <>
            <input
              id={`${name}-etc`}
              type="radio"
              value={label}
              className="h-16 w-16 accent-blue-500"
              {...register(name)}
              onChange={handleRadioChange}
            />
            <label
              htmlFor={`${name}-etc`}
              className="cursor-pointer text-body2r text-black"
            >
              {label}
            </label>
          </>
        ) : (
          <>
            <input
              id={`${name}-etc`}
              type="checkbox"
              checked={isEtcSelected}
              className="h-16 w-16 accent-blue-500"
              onChange={handleCheckboxChange}
            />
            <label
              htmlFor={`${name}-etc`}
              className="cursor-pointer text-body2r text-black"
            >
              {label}
            </label>
          </>
        )}
      </div>

      {isEtcSelected && (
        <div className="ml-36 space-y-8">
          <textarea
            ref={(e) => {
              registerRef(e);
              textareaRef.current = e;
            }}
            className="w-full resize-none overflow-hidden bg-transparent text-body2r text-black"
            rows={1}
            maxLength={100}
            placeholder="기타 내용을 입력하세요"
            {...restRegister}
            onChange={handleTextChange}
          />
          <hr className="border-gray-100" />
        </div>
      )}
    </div>
  );
}
