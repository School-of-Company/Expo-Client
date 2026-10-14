import { Metadata } from 'next';
import { RegistrationDashboardPage } from '@/views/registration/dashboard';

export const metadata: Metadata = {
  title: '사전등록 관리',
  description:
    '박람회의 사전등록·프로그램 신청 현황과 일자별 일정을 확인하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationDashboardPage />;
};

export default Page;
