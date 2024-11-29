'use client';
import { usePathname } from 'next/navigation';
import useStore from '@/shared/stores/useStore';
import { userNavItems, manageNavItems } from './navigationItems';
import { NavItem } from './types';

export const useNavigation = () => {
  const { role } = useStore();

  const pathname = usePathname();

  const isActive = (path: string): boolean => pathname === path;

  const getColor = (path: string): string =>
    isActive(path) ? '#448FFF' : '#909090';

  const navItems: NavItem[] =
    role === 'user' ? userNavItems : role === 'manage' ? manageNavItems : [];
  return { navItems, getColor };
};
