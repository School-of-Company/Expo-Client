'use client';

import React, { useRef } from 'react';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface TextAreaFieldProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  register: UseFormRegister<FieldValues>;
  readOnly?: boolean;
  defaultValue?: string;
  warningMessage?: string | null;
}

export default function TextAreaField({
  name,
  label,
  required = false,
  placeholder,
  maxLength = 1000,
  rows = 3,
  register,
  readOnly = false,
  defaultValue = '',
  warningMessage,
}: TextAreaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { ref, onChange, ...rest } = register(name, {
    required: required ? '필수 옵션을 작성해주세요' : false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    if (readOnly) return;

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="relative flex flex-col gap-8">
      <div className="relative">
        <textarea
          ref={(el) => {
            textareaRef.current = el;
            ref(el);
          }}
          className="w-full resize-none overflow-hidden bg-transparent text-body2r text-black"
          rows={rows}
          maxLength={maxLength}
          onChange={handleChange}
          placeholder={placeholder || label}
          readOnly={readOnly}
          defaultValue={defaultValue}
          {...rest}
        />
      </div>
      <hr className="border-gray-100" />
      {warningMessage && (
        <p className="whitespace-pre-line text-body2r text-error mobile:text-caption2r">
          {warningMessage}
        </p>
      )}
    </div>
  );
}
