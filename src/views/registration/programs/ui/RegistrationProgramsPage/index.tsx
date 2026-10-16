'use client';

import { useParams } from 'next/navigation';
import { ProgramListTable } from '@/features/program/list';
import { PageShell } from '@/widgets/layout';
import { ProgramsHubTabs, RegistrationTabs } from '@/widgets/registration';

/** 프로그램 페이지의 조회·출석 탭 */
const RegistrationProgramsPage = () => {
  const { expoId } = useParams<{ expoId: string }>();

  return (
    <PageShell subHeader={<RegistrationTabs />}>
      <div className="flex w-full max-w-[1200px] flex-col gap-24">
        <ProgramsHubTabs />
        <ProgramListTable expoId={expoId} />
      </div>
    </PageShell>
  );
};

export default RegistrationProgramsPage;
