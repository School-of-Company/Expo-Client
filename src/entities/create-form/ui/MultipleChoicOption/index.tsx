import React from 'react';
import { XMark } from '@/shared/assets/icons';
import { Circle } from '@/shared/assets/svg';

interface Props {
  type?: 'default' | 'etc';
}

const MultipleChoicOption = ({ type = 'default' }: Props) => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex w-full items-center gap-[10px]">
        <Circle />
        {type === 'default' ? (
          <input
            placeholder="문장을 입력해주세요."
            className="w-[60%] text-body4 text-black"
          />
        ) : (
          <div className="flex items-center gap-[10px]">
            <p className="text-body4 text-black">기타</p>
            <p className="text-caption2 text-gray-300">(직접입력)</p>
          </div>
        )}
      </div>
      <button>
        <XMark />
      </button>
    </div>
  );
};

export default MultipleChoicOption;
