'use client';

import { ScheduleManager } from '@/features/registration/schedule';
import { PageShell } from '@/widgets/layout';
import { ProgramsHubTabs, RegistrationTabs } from '@/widgets/registration';

/** 프로그램 페이지의 회차·모집 탭 */
const RegistrationSchedulePage = () => {
  return (
    <PageShell subHeader={<RegistrationTabs />}>
      <div className="flex w-full flex-col items-center gap-24">
        <div className="w-full max-w-[1200px]">
          <ProgramsHubTabs />
        </div>
        <ScheduleManager />
      </div>
    </PageShell>
  );
};

export default RegistrationSchedulePage;
