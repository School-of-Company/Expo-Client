import React from 'react';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';

const ProgramNavigation: React.FC = () => {
  const { navigation, setNavigation } = useNavigationStore();

  return (
    <div className="flex justify-center gap-[18px]">
      <button
        className={`text-h2 ${
          navigation === 'standard' ? 'text-black' : 'text-gray-500'
        }`}
        onClick={() => setNavigation('standard')}
      >
        일반 프로그램
      </button>
      <button
        className={`text-h2 ${
          navigation === 'training' ? 'text-black' : 'text-gray-500'
        }`}
        onClick={() => setNavigation('training')}
      >
        연수 프로그램
      </button>
    </div>
  );
};

export default ProgramNavigation;
