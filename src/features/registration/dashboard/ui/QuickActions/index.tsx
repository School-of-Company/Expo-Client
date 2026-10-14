import Link from 'next/link';
import { getExpoRoutes } from '@/shared/config';
import { useRegistrationExpo } from '../../../common';

interface Action {
  href: string;
  label: string;
  /** 참가자 화면처럼 관리 흐름 밖의 화면은 새 탭으로 연다 */
  isExternal?: boolean;
}

/** 대시보드에서 바로 넘어가는 자주 쓰는 작업. 화면 이동은 위쪽 탭이 맡는다 */
const QuickActions = () => {
  const { expoId, routes } = useRegistrationExpo();
  const expoRoutes = getExpoRoutes(expoId);
  const actions: Action[] = [
    { href: routes.applications, label: '그룹 문자 보내기' },
    { href: expoRoutes.paperQr, label: '현장 QR 인쇄' },
    { href: expoRoutes.checkIn, label: '입장 스캔' },
    { href: routes.schedule, label: '모집 열기·마감' },
    {
      href: expoRoutes.applicationForms,
      label: '사용자 신청화면',
      isExternal: true,
    },
  ];

  return (
    <nav aria-label="빠른 작업" className="flex flex-wrap gap-8">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          {...(action.isExternal && {
            target: '_blank',
            rel: 'noopener noreferrer',
          })}
          className="rounded-sm border-1 border-solid border-gray-200 px-16 py-8 text-body2r text-gray-500 duration-200 hover:border-main-600 hover:text-main-600 mobile:text-caption1r"
        >
          {action.label}
        </Link>
      ))}
    </nav>
  );
};

export default QuickActions;
