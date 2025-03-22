import React, { useRef } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { ApplicationFormValues } from '@/shared/types/application/type';

interface Props {
  maxLength: number;
  row: number;
  required: boolean;
  register: UseFormRegister<ApplicationFormValues>;
  name: string;
}

export default function SentenceOption({
  maxLength,
  row,
  required,
  register,
  name,
}: Props) {
  const { ref, onChange, ...rest } = register(name, {
    required: required ? '필수 옵션을 작성해주세요' : false,
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <div className="relative">
        <textarea
          ref={(el) => {
            textareaRef.current = el;
            ref(el);
          }}
          className="text-body3 w-full resize-none overflow-hidden bg-transparent text-black"
          rows={row}
          maxLength={maxLength}
          onChange={handleChange}
          placeholder={name}
          {...rest}
        />
      </div>
      <hr className="border-gray-200" />
    </div>
  );
}
