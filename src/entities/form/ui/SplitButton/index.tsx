'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, ArrowDown } from '@/shared/assets/icons';

export type DynamicFormType = 'NAME' | 'PHONE_NUMBER' | 'TRAINEE_ID';

interface SplitButtonProps {
  onDefaultClick: () => void;
  onSpecialFieldClick: (type: DynamicFormType) => void;
  text?: string;
  disabledOptions?: Set<string>;
}

const SPECIAL_FIELD_OPTIONS: { value: DynamicFormType; label: string }[] = [
  { value: 'NAME', label: '이름' },
  { value: 'PHONE_NUMBER', label: '전화번호' },
  { value: 'TRAINEE_ID', label: '연수자아이디' },
];

const SplitButton = ({
  onDefaultClick,
  onSpecialFieldClick,
  text = '추가하기',
  disabledOptions = new Set(),
}: SplitButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSpecialFieldClick = (type: DynamicFormType) => {
    if (!disabledOptions.has(type)) {
      onSpecialFieldClick(type);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={onDefaultClick}
          className="flex items-center gap-12 rounded-l-sm bg-main-100 px-16 py-12"
        >
          <Plus fill="#448FFF" />
          <p className="text-body2r text-main-600">{text}</p>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center rounded-r-sm bg-main-100 px-8 py-12"
        >
          <ArrowDown fill="#448FFF" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-10 mb-4 w-full min-w-[160px] rounded-sm border-1 border-solid border-gray-200 bg-white shadow-lg">
          {SPECIAL_FIELD_OPTIONS.map((option) => {
            const isDisabled = disabledOptions.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSpecialFieldClick(option.value)}
                disabled={isDisabled}
                className={`w-full px-16 py-12 text-left text-body2r first:rounded-t-sm last:rounded-b-sm ${
                  isDisabled
                    ? 'cursor-not-allowed text-gray-400 opacity-50'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SplitButton;
