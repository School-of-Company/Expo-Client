import { Museum, Person } from '@/shared/assets/icons';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  { href: '/', icon: Museum, label: '박람회' },
  { href: '/admin', icon: Person, label: '관리자' },
];
