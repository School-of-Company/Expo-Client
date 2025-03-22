'use client';

import { ArrowDown } from '@/shared/assets/icons';
import { useExpoListSelect } from '../../model/expoListSelect';

const ExpoListSelect = () => {
  const { options, selectedOption, isOpen, handleOptionClick, toggleOpen } =
    useExpoListSelect();

  return (
    <div className="relative inline-block">
      <button
        className="whitespace-nowrap rounded-[10px] bg-main-600 px-[14px] py-3"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-[10px] text-caption2 text-white">
          {selectedOption?.label}
          <ArrowDown fill="#fff" />
        </div>
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-12 z-30 w-[100px] -translate-x-1/2 transform rounded-lg bg-main-600 py-3">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex h-12 w-full cursor-pointer items-center justify-center text-caption1 text-white hover:bg-main-500"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpoListSelect;
