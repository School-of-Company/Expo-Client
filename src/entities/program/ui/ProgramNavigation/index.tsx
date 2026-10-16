'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';
import { TitleTabs } from '@/shared/ui';

// 사전등록 회차는 프로그램이 아니지만 같은 화면에서 탭으로 오간다
const TABS = [
  { value: 'standard', label: '일반 프로그램' },
  { value: 'training', label: '연수 프로그램' },
  { value: 'preregister', label: '사전등록' },
];

const ProgramNavigation = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const navigation = searchParams.get('navigation') || 'standard';

  return (
    <TitleTabs
      ariaLabel="프로그램 구분"
      value={navigation}
      options={TABS}
      onChange={(next) =>
        router.push(`${window.location.pathname}?navigation=${next}`)
      }
    />
  );
};

export default ProgramNavigation;
