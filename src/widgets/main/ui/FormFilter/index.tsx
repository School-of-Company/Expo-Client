'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp } from '@/shared/assets/icons';
import { OptionType } from '@/entities/main/model/types';

interface formFilterProps {
  options: { name: string; options: OptionType[] }[];
  selectedOption: OptionType;
  setSelectedOption: (option: OptionType) => void;
}

const FormFilter = ({
  options,
  selectedOption,
  setSelectedOption,
}: formFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: OptionType) => {
    const isSameOption =
      option.value === selectedOption?.value &&
      option.status === selectedOption?.status;
    setSelectedOption(
      isSameOption ? { value: '필터', label: '필터', status: true } : option,
    );
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        className="whitespace-nowrap rounded-[10px] bg-main-600 px-[14px] py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-[24px] text-caption1r text-white">
          {selectedOption.label || '필터'}
          {isOpen ? <ArrowUp fill="#fff" /> : <ArrowDown fill="#fff" />}
        </div>
      </button>
      {isOpen && (
        <div className="top-45 absolute right-0 z-30 mt-[1rem] w-[23.375rem] rounded-lg border-2 border-solid border-gray-200 bg-white p-7">
          <h1 className="mb-[1.5rem] text-h3b">필터</h1>
          <div>
            <div className="flex flex-wrap justify-between gap-y-[1rem]">
              {options.map((filter) => (
                <div key={filter.name}>
                  <p className="mb-[1rem] text-body1r">{filter.name}</p>
                  <div className="flex flex-wrap justify-between gap-y-[1rem]">
                    {filter.options.map((option) => (
                      <div
                        key={option.value}
                        className={`flex h-[2.875rem] w-[9.375rem] cursor-pointer items-center justify-center rounded-sm border-1 border-solid border-gray-200 py-8 text-body2r text-gray-500 hover:bg-main-500 hover:text-white ${option.label === selectedOption.label && 'bg-[#3B82F6] text-white'}`}
                        onClick={() => handleOptionClick(option)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormFilter;
