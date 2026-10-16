'use client';

import { ProgramFormList } from '@/features/registration/schedule';
import { PageShell } from '@/widgets/layout';
import { ProgramsHubTabs, RegistrationTabs } from '@/widgets/registration';

/** 프로그램 페이지의 신청 폼 탭 */
const ProgramFormListPage = () => {
  return (
    <PageShell subHeader={<RegistrationTabs />}>
      <div className="flex w-full flex-col items-center gap-24">
        <div className="w-full max-w-[1200px]">
          <ProgramsHubTabs />
        </div>
        <ProgramFormList />
      </div>
    </PageShell>
  );
};

export default ProgramFormListPage;
