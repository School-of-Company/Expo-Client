'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRegistrationExpo } from '@/features/registration/common';
import { getExpoRoutes } from '@/shared/config';
import { DetailHeader } from '@/shared/ui';

/**
 * 박람회 관리 화면 위쪽 머리. 모니터링 화면(대시보드·접수대장·행정 이력·입·퇴장)에서는 그 사이를 오가는 탭을 보여 준다.
 * 신청관리처럼 박람회 상세 패널에서 들어오는 화면은 박람회 이름만 보여 준다.
 * 대시보드는 하위 경로가 모두 앞에 붙어 있어 정확히 같을 때만 켠다
 */
const RegistrationTabs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { expoId, expo, routes } = useRegistrationExpo();

  const tabs = [
    { href: routes.dashboard, label: '실시간 대시보드', exact: true },
    { href: routes.attendance, label: '실시간 입·퇴장' },
    { href: routes.applications, label: '접수대장' },
    { href: routes.history, label: '행정 이력' },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  const isMonitoring = tabs.some(({ href, exact }) => isActive(href, exact));

  return (
    <div className="flex w-full justify-center px-16">
      <div className="flex w-full max-w-[1200px] flex-col gap-16">
        <div className="flex items-end justify-between gap-16">
          <div className="min-w-0 space-y-4">
            {expo && (
              <p className="truncate text-body2b text-gray-500">{expo.title}</p>
            )}
            {/* 모니터링은 박람회 상세 패널에서 들어오므로 뒤로 가면 상세로 돌아간다 */}
            {isMonitoring && (
              <DetailHeader
                className="gap-12"
                headerTitle="모니터링"
                onBack={() =>
                  router.push(
                    `/exhibition/detail/${encodeURIComponent(expoId)}`,
                  )
                }
              />
            )}
          </div>
          <Link
            href={getExpoRoutes(expoId).applicationForms}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 whitespace-nowrap text-body2r text-main-600 underline mobile:text-caption1r"
          >
            사용자 신청화면
          </Link>
        </div>
        {isMonitoring && (
          <nav
            aria-label="모니터링 메뉴"
            className="grid grid-cols-4 gap-8 mobile:grid-cols-2"
          >
            {tabs.map(({ href, label, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-sm border-1 border-solid px-12 py-10 text-center text-body2b mobile:text-caption1b ${
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
        )}
      </div>
    </div>
  );
};

export default RegistrationTabs;
