'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, ArrowDown } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';
import { DynamicFormType } from '@/shared/types/form/create/type';

interface SplitButtonProps {
  onDefaultClick: () => void;
  onSpecialFieldClick: (type: DynamicFormType) => void;
  specialFieldOptions: { value: DynamicFormType; label: string }[];
  text?: string;
  disabledOptions?: Set<string>;
}

const SplitButton = ({
  onDefaultClick,
  onSpecialFieldClick,
  specialFieldOptions,
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
          className={`flex items-center gap-12 bg-main-100 px-16 py-12 ${
            specialFieldOptions.length > 0 ? 'rounded-l-sm' : 'rounded-sm'
          }`}
        >
          <Plus fill={COLORS.main600} />
          <p className="text-body2r text-main-600">{text}</p>
        </button>

        {specialFieldOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center rounded-r-sm bg-main-100 px-8 py-12"
          >
            <ArrowDown fill={COLORS.main600} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-10 mb-4 w-full min-w-[160px] rounded-sm border-1 border-solid border-gray-200 bg-white shadow-lg">
          {specialFieldOptions.map((option) => {
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
