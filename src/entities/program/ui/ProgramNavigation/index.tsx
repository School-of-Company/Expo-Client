import React from 'react';

interface ProgramNavigationProps {
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
}

const ProgramNavigation: React.FC<ProgramNavigationProps> = ({
  state,
  setState,
}) => {
  return (
    <div className="flex gap-[18px]">
      <button
        className={`text-h2 ${state === 'standard' ? 'text-black' : 'text-gray-500'}`}
        onClick={() => {
          setState('standard');
        }}
      >
        일반 프로그램
      </button>
      <button
        className={`text-h2 ${state === 'training' ? 'text-black' : 'text-gray-500'}`}
        onClick={() => {
          setState('training');
        }}
      >
        연수 프로그램
      </button>
    </div>
  );
};

export default ProgramNavigation;
