'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ProgramNavigation = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [navigation, setNavigation] = useState<string>('standard');

  useEffect(() => {
    const currentNavigation = searchParams.get('navigation') || 'standard';
    setNavigation(currentNavigation);
  }, [searchParams]);

  const handleNavigationChange = (newNavigation: string) => {
    router.push(`${window.location.pathname}?navigation=${newNavigation}`);
    setNavigation(newNavigation);
  };

  return (
    <div className="flex justify-center gap-[18px]">
      <button
        type="button"
        className={`text-h2b ${
          navigation === 'standard' ? 'text-black' : 'text-gray-500'
        }`}
        onClick={() => handleNavigationChange('standard')}
      >
        일반 프로그램
      </button>
      <button
        type="button"
        className={`text-h2b ${
          navigation === 'training' ? 'text-black' : 'text-gray-500'
        }`}
        onClick={() => handleNavigationChange('training')}
      >
        연수 프로그램
      </button>
    </div>
  );
};

export default ProgramNavigation;
