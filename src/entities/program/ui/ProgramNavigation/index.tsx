'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// 사전등록 회차는 프로그램이 아니지만 같은 화면에서 탭으로 오간다
const TABS = [
  { value: 'standard', label: '일반 프로그램' },
  { value: 'training', label: '연수 프로그램' },
  { value: 'preregister', label: '사전등록 회차' },
];

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
    <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-8">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={navigation === value}
          className={`text-h2b mobile:text-body1b ${
            navigation === value ? 'text-black' : 'text-gray-500'
          }`}
          onClick={() => handleNavigationChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ProgramNavigation;
