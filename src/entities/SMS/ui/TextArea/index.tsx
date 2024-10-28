import React, { useRef, useEffect } from 'react';

interface TextAreaProps {
  title: string;
  placeholder: string;
  maxLength: number;
  text: string;
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
  row: number;
}

export default function TextArea({
  title,
  placeholder,
  maxLength,
  text,
  state,
  setState,
  row,
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(e.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [state]);

  return (
    <div>
      <p className="mb-[10px] text-h4 text-black">{title}</p>
      <div className={`relative flex flex-col gap-2 ${text}`}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            className="w-full resize-none overflow-hidden rounded-sm border-1 border-solid border-gray-200 bg-transparent p-[30px] py-5 text-black caret-main-500"
            onChange={handleChange}
            value={state}
            rows={row}
          />
        </div>
        {state.length > 0 && (
          <p
            className={`text-end text-caption2 ${state.length > maxLength ? 'text-error' : 'text-main-500'}`}
          >
            {state.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
