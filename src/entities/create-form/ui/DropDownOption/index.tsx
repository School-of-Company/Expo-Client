import React from 'react';
import { XMark } from '@/shared/assets/icons';

const DropDownOption = () => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex w-full items-center gap-[10px]">
        <p className="text-body3 text-gray-500">1</p>
        <input
          placeholder="문장을 입력해주세요."
          className="w-[60%] text-body4 text-black"
        />
      </div>
      <button>
        <XMark />
      </button>
    </div>
  );
};

export default DropDownOption;
