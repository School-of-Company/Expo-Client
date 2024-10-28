import React from 'react';
import { XMark } from '@/shared/assets/icons';

interface Props {
  number: number;
}

const ExpoInput = ({ number }: Props) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-6">
        <p className="text-body4 text-gray-500">{number}</p>
        <input
          placeholder={`연수 입력해주세요`}
          className="bg-transparent text-body4 text-gray-500"
        />
      </div>
      <button className="hover:cursor-pointer">
        <XMark />
      </button>
    </div>
  );
};

export default ExpoInput;
