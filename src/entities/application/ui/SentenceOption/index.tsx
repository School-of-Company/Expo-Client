import React, { useRef, useState } from 'react';
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
  const { ref, onChange, ...rest } = register(name);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [hasInput, setHasInput] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setHasInput(e.target.value.length > 0);

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
          className="w-full resize-none overflow-hidden bg-transparent text-body4 text-black placeholder-transparent"
          rows={row}
          maxLength={maxLength}
          onChange={handleChange}
          {...rest}
        />
        {!hasInput && (
          <label className="pointer-events-none absolute left-0 top-0 text-gray-500">
            {name}
            {required && <span className="text-sky-500"> *</span>}
          </label>
        )}
      </div>
      <hr className="border-gray-200" />
    </div>
  );
}
