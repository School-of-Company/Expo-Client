'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp } from '@/shared/assets/icons';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const FormTypeSelect = ({ options }: { options: Option[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options[0] || null,
  );

  return (
    <div className="relative w-[196px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border-1 border-solid border-gray-100 bg-white px-3 py-[10px]"
      >
        <div className="flex items-center">
          {selectedOption?.icon && (
            <span className="mr-2">{selectedOption.icon}</span>
          )}
          <span className="text-h5 text-gray-500">{selectedOption?.label}</span>
        </div>
        {isOpen ? <ArrowUp fill="#909090" /> : <ArrowDown fill="#909090" />}
      </button>
      {isOpen && (
        <ul className="absolute mt-1 flex w-full flex-col items-center gap-[10px] rounded-md border-1 border-solid border-gray-100 bg-white py-[30px] shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                setSelectedOption(option);
                setIsOpen(false);
              }}
              className="flex w-full cursor-pointer items-center justify-center p-2 text-h5 text-gray-500 hover:bg-gray-100"
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormTypeSelect;
