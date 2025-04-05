import React, { useState, useRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface TextAreaProps {
  title: string;
  placeholder: string;
  maxLength: number;
  registration: UseFormRegisterReturn;
  row: number;
}

export default function TextArea({
  title,
  placeholder,
  maxLength,
  registration,
  row,
}: TextAreaProps) {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div>
      <p className="mb-[10px] text-h3b text-black">{title}</p>
      <div className={`relative flex flex-col gap-2`}>
        <div className="relative">
          <textarea
            ref={(e) => {
              registration.ref(e);
              textareaRef.current = e;
            }}
            placeholder={placeholder}
            className="w-full resize-none overflow-hidden rounded-sm border-1 border-solid border-gray-200 bg-transparent px-16 py-12 leading-[32px] text-black caret-main-500"
            onBlur={registration.onBlur}
            name={registration.name}
            rows={row}
            maxLength={maxLength}
            onChange={(e) => {
              registration.onChange(e);
              handleChange(e);
            }}
          />
        </div>
        <div className="text-caption2 text-end text-main-500">
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  );
}
