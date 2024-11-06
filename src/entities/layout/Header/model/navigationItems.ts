import { Museum, Person } from '@/shared/assets/icons';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  { href: '/create-exhibition', icon: Museum, label: '박람회 만들기' },
  { href: '/admin', icon: Person, label: '김진원 관리자' },
];
