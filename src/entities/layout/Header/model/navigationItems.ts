import { Museum, Person } from '@/shared/assets/icons';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  { href: '/admin', icon: Museum, label: '박람회' },
  { href: '/admin/accounts', icon: Person, label: '관리자' },
];
