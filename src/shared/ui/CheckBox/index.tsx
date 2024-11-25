import React, { useState } from 'react';
import { Check } from '@/shared/assets/icons';

const CheckBox = ({ text }: { text: string }) => {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="flex items-center gap-5">
      <p className="text-body4 text-gray-500">{text}</p>
      <div
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-solid border-gray-200 bg-white"
        onClick={() => setIsChecked(!isChecked)}
      >
        {isChecked && <Check />}
      </div>
    </div>
  );
};

export default CheckBox;
