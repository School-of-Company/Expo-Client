import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface TextAreaProps {
  title: string;
  placeholder: string;
  maxLength: number;
  registration: UseFormRegisterReturn;
  row: number;
  value?: string;
}

export default function TextArea({
  title,
  placeholder,
  maxLength,
  registration,
  row,
  value = '',
}: TextAreaProps) {
  const [charCount, setCharCount] = useState(value.length);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 내용에 맞춰 높이를 늘린다. 숨겨진 단계 안에서는 scrollHeight 가 0 이라 고정하면 0px 로 눌리므로 rows 높이에 맡긴다
  const fitHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    if (textarea.scrollHeight > 0)
      textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    setCharCount(value.length);
    fitHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    fitHeight();
    registration.onChange(e);
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
            value={value}
            onChange={handleChange}
          />
        </div>
        <div className="text-caption2 text-end text-main-500">
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  );
}
