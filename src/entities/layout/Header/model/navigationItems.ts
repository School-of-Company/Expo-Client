import { Calendar, Museum, Person } from '@/shared/assets/icons';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  { href: '/', icon: Museum, label: '박람회' },
  // 미래교육박람회 전용 대시보드. 행사가 끝나면 이 줄만 지우면 된다(박람회 상세의 '사전등록 관리'는 그대로)
  { href: '/admin/future-edu-expo', icon: Calendar, label: '미래교육박람회' },
  { href: '/admin', icon: Person, label: '관리자' },
];
