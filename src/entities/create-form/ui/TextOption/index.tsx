import React from 'react';
import { XMark } from '@/shared/assets/icons';

const TextOption = () => {
  return (
    <div className="flex w-full items-center justify-between">
      <input
        placeholder="문장을 입력해주세요."
        className="w-[60%] text-body4 text-black"
      />
      <button>
        <XMark />
      </button>
    </div>
  );
};

export default TextOption;
