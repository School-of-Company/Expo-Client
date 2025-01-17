import React from 'react';
import { XMark } from '@/shared/assets/icons';
import { Circle } from '@/shared/assets/svg';

const MultipleChoicOption = () => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex w-full items-center gap-[10px]">
        <Circle />
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

export default MultipleChoicOption;
