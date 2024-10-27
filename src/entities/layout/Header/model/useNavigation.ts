'use client';
import { usePathname } from 'next/navigation';
import { navItems } from './navigationItems';

export const useNavigation = () => {
  const pathname = usePathname();

  const isActive = (path: string): boolean => pathname === path;

  const getColor = (path: string): string =>
    isActive(path) ? '#448FFF' : '#909090';

  return { navItems, getColor };
};
