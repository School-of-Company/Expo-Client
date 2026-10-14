'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { COLORS } from '@/shared/config';
import { navItems } from './navigationItems';

export const useNavigation = () => {
  const pathname = usePathname();

  // 하위 경로에서도 메뉴가 켜지도록 경로가 가장 길게 겹치는 메뉴 하나만 활성으로 본다
  // (/admin/future-edu-expo/... 에서는 '관리자'가 아니라 '미래교육박람회')
  const activeHref = useMemo(
    () =>
      navItems
        .filter(
          ({ href }) =>
            pathname === href ||
            (href !== '/' && pathname.startsWith(`${href}/`)),
        )
        .sort((a, b) => b.href.length - a.href.length)[0]?.href,
    [pathname],
  );

  const isActive = useMemo(
    () => (path: string) => path === activeHref,
    [activeHref],
  );

  const getColor = useMemo(
    () => (path: string) => (isActive(path) ? COLORS.main600 : COLORS.black),
    [isActive],
  );

  return { navItems, getColor };
};
