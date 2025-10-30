import React, { useState, useCallback } from 'react';
import { SearchIcon, XMark } from '@/shared/assets/svg';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  onChange,
  placeholder = '검색어를 입력하세요',
  className = '',
  onClear,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState('');

  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (!isControlled) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }

    onChange?.('');
    onClear?.();
  }, [isControlled, onChange, onClear]);

  return (
    <div
      className={`relative flex items-center ${className} rounded-sm border-1 border-solid border-gray-200`}
    >
      <div className="pointer-events-none absolute left-8 flex items-center">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-sm border border-gray-300 bg-white px-36 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      />

      {inputValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 flex items-center text-gray-400 transition-colors hover:text-gray-600"
          aria-label="검색어 지우기"
        >
          <XMark className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
