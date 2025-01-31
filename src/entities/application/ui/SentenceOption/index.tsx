import React, { useRef, useState } from 'react';

interface Props {
  placeholder: string;
  maxLength: number;
  row: number;
  required: boolean;
}

export default function SentenceOption({
  placeholder,
  maxLength,
  row,
  required,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [hasInput, setHasInput] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    setHasInput(e.target.value.length > 0);
  };

  return (
    <div className="relative flex flex-col gap-2">
      <div className="relative">
        <textarea
          ref={(e) => {
            textareaRef.current = e;
          }}
          className="w-full resize-none overflow-hidden bg-transparent text-body4 text-black placeholder-transparent"
          rows={row}
          maxLength={maxLength}
          onChange={handleChange}
        />
        {!hasInput && (
          <label className="pointer-events-none absolute left-0 top-0 text-gray-500">
            {placeholder}
            {required && <span className="text-sky-500"> *</span>}
          </label>
        )}
      </div>
      <hr className="border-gray-200" />
    </div>
  );
}
