import { Metadata } from 'next';
import { RegistrationApplicationsPage } from '@/views/registration/applications';

export const metadata: Metadata = {
  title: '접수 관리대장',
  description:
    '사전등록·프로그램 신청자를 조회하고 그룹 문자 발송, CSV 내보내기를 할 수 있는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationApplicationsPage />;
};

export default Page;
