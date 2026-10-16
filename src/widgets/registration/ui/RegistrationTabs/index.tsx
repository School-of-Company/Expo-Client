'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRegistrationExpo } from '@/features/registration/common';
import { getExpoRoutes } from '@/shared/config';

/** 박람회 관리 하위 화면을 오가는 탭. 대시보드는 하위 경로가 모두 앞에 붙어 있어 정확히 같을 때만 켠다 */
const RegistrationTabs = () => {
  const pathname = usePathname();
  const { expoId, routes } = useRegistrationExpo();

  const tabs = [
    { href: routes.dashboard, label: '모니터링', exact: true },
    { href: routes.applications, label: '접수대장' },
    { href: routes.preregister, label: '사전등록' },
    // 프로그램 조회·출석, 회차·모집, 신청 폼은 프로그램 페이지 한 화면에 모았다
    { href: routes.programs, label: '프로그램' },
    { href: routes.participants, label: '참가자 검색' },
    { href: routes.operations, label: '박람회 운영' },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex w-full justify-center px-16">
      <div className="flex w-full max-w-[1200px] flex-col gap-12">
        <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-stretch">
          <nav
            aria-label="박람회 관리 메뉴"
            className="flex min-w-0 gap-8 overflow-x-auto"
          >
            {tabs.map(({ href, label, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`shrink-0 whitespace-nowrap rounded-sm border-1 border-solid px-20 py-8 text-body2b mobile:px-12 mobile:text-caption1b ${
                    active
                      ? 'border-main-600 bg-main-600 text-white'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <Link
            href={getExpoRoutes(expoId).applicationForms}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 whitespace-nowrap text-body2r text-main-600 underline mobile:self-end mobile:text-caption1r"
          >
            사용자 신청화면
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationTabs;
