'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { navItems } from './navigationItems';

export const useNavigation = () => {
  const pathname = usePathname();

  const isActive = useMemo(
    () => (path: string) => pathname === path,
    [pathname],
  );

  const getColor = useMemo(
    () => (path: string) => (isActive(path) ? '#448FFF' : '#121212'),
    [isActive],
  );

  return { navItems, getColor };
};
