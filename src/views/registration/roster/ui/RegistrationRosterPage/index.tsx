'use client';

import { useParams } from 'next/navigation';
import { ParticipantTable } from '@/features/exhibition/participants';
import { PageShell } from '@/widgets/layout';
import { ApplicationsHubTabs, RegistrationTabs } from '@/widgets/registration';

/** 참가자·문자 페이지의 명단 조회 탭 */
const RegistrationRosterPage = () => {
  const { expoId } = useParams<{ expoId: string }>();

  return (
    <PageShell subHeader={<RegistrationTabs />}>
      <div className="flex w-full max-w-[1200px] flex-col gap-24">
        <ApplicationsHubTabs />
        <ParticipantTable id={expoId} />
      </div>
    </PageShell>
  );
};

export default RegistrationRosterPage;
