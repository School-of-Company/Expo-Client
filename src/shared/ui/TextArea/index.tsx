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
  value = '', // 기본값 설정
}: TextAreaProps) {
  const [charCount, setCharCount] = useState(value.length); // 초기 글자 수 설정
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 외부 값 변경 시 글자 수 업데이트
  useEffect(() => {
    setCharCount(value.length);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // 높이를 초기화
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 동적 높이 설정
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    registration.onChange(e); // React Hook Form의 onChange 호출
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
            rows={row} // 초기 줄바꿈 설정
            maxLength={maxLength}
            value={value} // value를 명시적으로 전달
            onChange={handleChange} // handleChange 함수 호출
          />
        </div>
        <div className="text-caption2 text-end text-main-500">
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  );
}
