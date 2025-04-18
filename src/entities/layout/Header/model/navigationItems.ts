import { Museum, Person } from '@/shared/assets/icons';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  { href: '/exhibition/create', icon: Museum, label: '박람회 만들기' },
  { href: '/admin', icon: Person, label: '관리자' },
];
