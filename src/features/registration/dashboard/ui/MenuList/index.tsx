import Link from 'next/link';
import { ArrowRight } from '@/shared/assets/icons';
import { getExpoRoutes } from '@/shared/config';
import { useRegistrationExpo } from '../../../common';

interface Menu {
  href: string;
  title: string;
  description: string;
  /** 참가자 화면처럼 관리 흐름 밖의 화면은 새 탭으로 연다 */
  isExternal?: boolean;
}

const MenuList = () => {
  const { expoId, routes } = useRegistrationExpo();
  const menus: Menu[] = [
    {
      href: routes.schedule,
      title: '일정·모집 제어',
      description: '프로그램·회차·정원·신청기간·대기자 승급 정책 관리',
    },
    {
      href: routes.attendance,
      title: '실시간 입·퇴장',
      description: '회차별 입장·퇴장 현황과 현장 QR 확인',
    },
    {
      href: routes.applications,
      title: '접수 관리대장',
      description: '신청 원장 조회·필터·상세·취소, 그룹 문자, Excel 출력',
    },
    {
      href: routes.history,
      title: '행정 이력',
      description: '신청·발송·모집 변경 처리 이력',
    },
    {
      href: routes.operations,
      title: '박람회 운영',
      description:
        '참가자 조회, 폼, 현장 등록·입장 QR, 프로그램, 문자, 경품 추첨',
    },
    {
      href: routes.survey,
      title: '만족도 조사',
      description: '일반·연수자 설문 문항 편집·삭제, 경품 추첨 설정',
    },
    {
      href: getExpoRoutes(expoId).applicationForms,
      title: '사용자 신청화면',
      description: '참가자가 보는 신청 화면을 새 탭에서 확인',
      isExternal: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
      {menus.map((menu) => (
        <Link
          key={menu.href}
          href={menu.href}
          {...(menu.isExternal && {
            target: '_blank',
            rel: 'noopener noreferrer',
          })}
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
