'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useRole } from '@/shared/model/useRole';
import { userNavItems, manageNavItems } from './navigationItems';

export const useNavigation = () => {
  const role = useRole();
  const pathname = usePathname();

  const isActive = useMemo(
    () => (path: string) => pathname === path,
    [pathname],
  );

  const getColor = useMemo(
    () => (path: string) => (isActive(path) ? '#448FFF' : '#121212'),
    [isActive],
  );

  const navItems = useMemo(() => {
    switch (role) {
      case 'user':
        return userNavItems;
      case 'manage':
        return manageNavItems;
      default:
        return [];
    }
  }, [role]);

  return { navItems, getColor };
};
