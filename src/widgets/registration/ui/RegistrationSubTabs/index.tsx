'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface RegistrationSubTab {
  href: string;
  label: string;
  /** 하위 경로가 다른 탭이면 정확히 같을 때만 켠다 */
  exact?: boolean;
}

interface RegistrationSubTabsProps {
  label: string;
  tabs: RegistrationSubTab[];
}

/** 한 페이지로 묶은 화면 안에서 영역을 오가는 탭. 탭마다 경로가 달라 각 화면의 쿼리를 건드리지 않는다 */
const RegistrationSubTabs = ({ label, tabs }: RegistrationSubTabsProps) => {
  const pathname = usePathname();

  const isActive = ({ href, exact }: RegistrationSubTab) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label={label}
      className="flex w-full gap-24 overflow-x-auto border-b-1 border-solid border-gray-200 mobile:gap-16"
    >
      {tabs.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 border-solid py-12 text-body2b ${
              active
                ? 'border-main-600 text-main-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default RegistrationSubTabs;
