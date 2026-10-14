'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  COLORS,
  FUTURE_EDU_EXPO_ID,
  FUTURE_EDU_EXPO_PATH,
  getRegistrationRoutes,
} from '@/shared/config';
import { navItems } from './navigationItems';

export const useNavigation = () => {
  const pathname = usePathname();

  // 하위 경로에서도 메뉴가 켜지도록 경로가 가장 길게 겹치는 메뉴 하나만 활성으로 본다.
  // 사전등록 관리(/admin/registration/{id})는 모든 박람회가 쓰므로, 설정된 미래교육박람회일 때만 '미래교육박람회'를 켠다
  const activeHref = useMemo(() => {
    const futureEduBase = FUTURE_EDU_EXPO_ID
      ? getRegistrationRoutes(FUTURE_EDU_EXPO_ID).dashboard
      : null;
    if (
      futureEduBase &&
      (pathname === futureEduBase || pathname.startsWith(`${futureEduBase}/`))
    ) {
      return FUTURE_EDU_EXPO_PATH;
    }
    return navItems
      .filter(
        ({ href }) =>
          pathname === href ||
          (href !== '/' && pathname.startsWith(`${href}/`)),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname]);

  const isActive = useMemo(
    () => (path: string) => path === activeHref,
    [activeHref],
  );

  const getColor = useMemo(
    () => (path: string) => (isActive(path) ? COLORS.main600 : COLORS.black),
    [isActive],
  );

  return { navItems, getColor };
};
