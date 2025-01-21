import React from 'react';
import { Check } from '@/shared/assets/icons';

interface Props {
  text: string;
  toggleCheck: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isCheckBox: boolean;
}

const CheckBox = ({ text, toggleCheck, isCheckBox }: Props) => {
  return (
    <button onClick={toggleCheck} className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] border-2 border-solid ${
          isCheckBox ? 'border-main-600' : 'border-gray-500'
        } bg-white`}
      >
        {isCheckBox && <Check />}
      </div>
      <p
        className={`text-caption2 ${isCheckBox ? 'text-main-600' : 'text-gray-500'}`}
      >
        {text}
      </p>
    </button>
  );
};

export default CheckBox;
