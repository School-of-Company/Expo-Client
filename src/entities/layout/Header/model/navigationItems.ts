import { Calendar, Museum, Person, Program } from '@/shared/assets/icons';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  { href: '/program', icon: Program, label: '프로그램' },
  { href: '/participants', icon: Calendar, label: '참가자 명단' },
  { href: '/create-exhibition', icon: Museum, label: '박람회 만들기' },
  { href: '/admin', icon: Person, label: '김진원 관리자' },
];
