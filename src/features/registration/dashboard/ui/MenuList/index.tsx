import Link from 'next/link';
import { ArrowRight } from '@/shared/assets/icons';
import { useRegistrationExpo } from '../../../common';

const MenuList = () => {
  const { routes } = useRegistrationExpo();
  const menus = [
    {
      href: routes.operations,
      title: '박람회 운영',
      description:
        '참가자 조회, 폼, 현장 등록·입장 QR, 프로그램, 문자, 경품 추첨',
    },
    {
      href: routes.applications,
      title: '접수 관리대장',
      description: '신청 원장 조회·필터·상세, 그룹 문자, Excel 출력',
    },
    {
      href: routes.schedule,
      title: '일정·모집 제어',
      description: '프로그램·회차·정원·신청기간·대기자 승급 정책 관리',
    },
    {
      href: routes.history,
      title: '행정 이력',
      description: '신청·발송·모집 변경 처리 이력 (서버 연결 준비 중)',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
      {menus.map((menu) => (
        <Link
          key={menu.href}
          href={menu.href}
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
