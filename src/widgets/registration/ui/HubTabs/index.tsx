'use client';

import { useRegistrationExpo } from '@/features/registration/common';
import RegistrationSubTabs from '../RegistrationSubTabs';

/** 프로그램 페이지: 조회·출석, 회차·모집, 신청 폼 */
export const ProgramsHubTabs = () => {
  const { routes } = useRegistrationExpo();
  return (
    <RegistrationSubTabs
      label="프로그램 메뉴"
      tabs={[
        { href: routes.programs, label: '조회·출석', exact: true },
        { href: routes.schedule, label: '회차·모집' },
        { href: routes.programForms, label: '신청 폼' },
      ]}
    />
  );
};

/** 참가자·문자 페이지: 명단 조회, 접수대장·문자 발송 */
export const ApplicationsHubTabs = () => {
  const { routes } = useRegistrationExpo();
  return (
    <RegistrationSubTabs
      label="참가자 메뉴"
      tabs={[
        { href: routes.roster, label: '명단 조회' },
        { href: routes.applications, label: '접수대장·문자', exact: true },
      ]}
    />
  );
};
