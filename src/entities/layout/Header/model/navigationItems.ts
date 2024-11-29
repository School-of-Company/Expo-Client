import { Museum, Person } from '@/shared/assets/icons';
import { NavItem } from './types';

export const userNavItems: NavItem[] = [
  { href: '/signIn', icon: Person, label: '관리자 로그인' },
];

export const manageNavItems: NavItem[] = [
  { href: '/create-exhibition', icon: Museum, label: '박람회 만들기' },
  { href: '/admin', icon: Person, label: '김진원 관리자' },
];
