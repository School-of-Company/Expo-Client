'use client';

import { ArrowDown } from '@/shared/assets/icons';
import { selectUserType } from '@/shared/model/selectUserType';

const SelectUserType = () => {
  const { options, selectedOption, isOpen, handleOptionClick, toggleOpen } =
    selectUserType();

  return (
    <div className="relative inline-block">
      <button type="button" onClick={toggleOpen}>
        <div className="flex items-center gap-5 text-h4 text-black">
          {selectedOption?.label} 연수 종류
          <ArrowDown />
        </div>
      </button>
      {isOpen && (
        <div className="absolute top-9 z-30 w-[90px] rounded-sm bg-white p-2 shadow-md">
          {options.map((option) => (
            <button
              key={option.value}
              className="flex h-12 w-full cursor-pointer items-center justify-center text-caption2 text-gray-500 hover:bg-main-100"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectUserType;
