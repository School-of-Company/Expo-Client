import { Suspense } from 'react';
import { RegistrationLedger } from '@/features/registration/applications';
import { PageShell } from '@/widgets/layout';
import { ApplicationsHubTabs, RegistrationTabs } from '@/widgets/registration';

/** 참가자·문자 페이지의 접수대장·문자 탭 */
const RegistrationApplicationsPage = () => {
  return (
    <PageShell subHeader={<RegistrationTabs />}>
      <div className="flex w-full flex-col items-center gap-24">
        <div className="w-full max-w-[1200px]">
          <ApplicationsHubTabs />
        </div>
        <Suspense>
          <RegistrationLedger />
        </Suspense>
      </div>
    </PageShell>
  );
};

export default RegistrationApplicationsPage;
