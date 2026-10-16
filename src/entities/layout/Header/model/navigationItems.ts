import { Calendar, Museum, Person } from '@/shared/assets/icons';
import { EXPO_LIST_PATH, FUTURE_EDU_EXPO_PATH } from '@/shared/config';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  { href: EXPO_LIST_PATH, icon: Museum, label: '박람회' },
  // 미래교육박람회 전용 대시보드. 행사가 끝나면 이 줄을 지운다
  { href: FUTURE_EDU_EXPO_PATH, icon: Calendar, label: '미래교육박람회' },
  { href: '/admin', icon: Person, label: '관리자' },
];
