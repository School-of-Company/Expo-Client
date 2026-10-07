import { Metadata } from 'next';
import { RegistrationDashboardPage } from '@/views/registration/dashboard';

export const metadata: Metadata = {
  title: '2026 AI 미래교육박람회',
  description:
    '2026 AI 미래교육박람회의 행사 정보, 사전등록·프로그램 신청 현황, 일자별 일정을 확인하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationDashboardPage />;
};

export default Page;
