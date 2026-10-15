import { Metadata } from 'next';
import { RegistrationApplicationsPage } from '@/views/registration/applications';

export const metadata: Metadata = {
  title: '접수 관리대장',
  description:
    '프로그램 회차 신청 원장을 조회·필터하고 Report 양식으로 Excel을 내려받는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationApplicationsPage />;
};

export default Page;
