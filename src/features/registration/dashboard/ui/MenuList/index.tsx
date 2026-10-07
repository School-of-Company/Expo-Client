import Link from 'next/link';
import { ArrowRight } from '@/shared/assets/icons';
import { FUTURE_EDU_EXPO_INFO, REGISTRATION_ROUTES } from '../../../common';

const MENUS = [
  {
    href: REGISTRATION_ROUTES.applications,
    title: '접수 관리대장',
    description: '신청자 조회, 취소·수동 승급, 그룹 문자, Excel 출력',
  },
  {
    href: REGISTRATION_ROUTES.schedule,
    title: '일정·모집 제어',
    description: '프로그램·회차·정원·신청기간·대기자 승급 정책 관리',
  },
  {
    href: REGISTRATION_ROUTES.history,
    title: '행정 이력',
    description: '상태 변경·자동 승급·문자 발송·일정 변경 기록',
  },
  {
    href: FUTURE_EDU_EXPO_INFO.userSiteUrl,
    title: '사용자 신청화면',
    description: '참가자가 보는 신청 화면을 새 창으로 확인',
    isExternal: true,
  },
];

const MenuList = () => {
  return (
    <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
      {MENUS.map((menu) => (
        <Link
          key={menu.href}
          href={menu.href}
          target={menu.isExternal ? '_blank' : undefined}
          rel={menu.isExternal ? 'noopener noreferrer' : undefined}
          className="flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 px-30 py-20 duration-200 hover:border-main-600 mobile:px-16"
        >
          <div className="min-w-0 space-y-8">
            <p className="text-body1b text-black">{menu.title}</p>
            <p className="text-caption1r text-gray-500">{menu.description}</p>
          </div>
          <ArrowRight />
        </Link>
      ))}
    </div>
  );
};

export default MenuList;
