import React from 'react';
import { Plus, XMark } from '@/shared/assets/icons';

interface Props {
  inputs: string[];
  addInput: () => void;
  removeInput: (index: number) => void;
  onChangeInput: (index: number, value: string) => void;
}

const ExpoInput = ({ onChangeInput, inputs, addInput, removeInput }: Props) => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        {inputs.map((input, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex flex-grow items-center gap-6">
              <p className="flex-shrink-0 text-body4 text-gray-500">
                {index + 1}
              </p>
              <input
                placeholder="연수를 입력해주세요"
                className="w-full bg-transparent text-body4 text-gray-500"
                value={input}
                onChange={(e) => onChangeInput(index, e.target.value)}
              />
            </div>
            <button
              onClick={() => removeInput(index)}
              className="flex-shrink-0 hover:cursor-pointer"
            >
              <XMark />
            </button>
          </div>
        ))}
      </div>
      <button
        className="mx-auto mt-6 flex items-center gap-5"
        onClick={addInput}
      >
        <Plus fill="#448FFF" />
        <div className="text-body3 text-main-600">추가하기</div>
      </button>
    </div>
  );
};

export default ExpoInput;
