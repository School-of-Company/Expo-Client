'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { COLORS } from '@/shared/config';
import { navItems } from './navigationItems';

export const useNavigation = () => {
  const pathname = usePathname();

  const isActive = useMemo(
    () => (path: string) => pathname === path,
    [pathname],
  );

  const getColor = useMemo(
    () => (path: string) => (isActive(path) ? COLORS.main600 : COLORS.black),
    [isActive],
  );

  return { navItems, getColor };
};
