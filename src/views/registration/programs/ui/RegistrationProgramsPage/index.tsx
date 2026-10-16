'use client';

import { ScheduleManager } from '@/features/registration/schedule';
import { PageShell } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

/**
 * 프로그램 페이지. 일반·연수 프로그램과 사전등록 회차를 한 표에서 추가·수정·삭제하고,
 * 프로그램 행의 출석 버튼으로 출석 화면에 간다. 신청 폼은 프로그램 양식에서 고르거나 새로 만든다
 */
const RegistrationProgramsPage = () => (
  <PageShell subHeader={<RegistrationTabs />}>
    <ScheduleManager />
  </PageShell>
);

export default RegistrationProgramsPage;
