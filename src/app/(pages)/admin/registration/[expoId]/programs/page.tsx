import { Metadata } from 'next';
import { RegistrationProgramsPage } from '@/views/registration/programs';

export const metadata: Metadata = {
  title: '프로그램',
  description:
    '프로그램 조회·출석, 회차·모집 설정, 프로그램 신청 폼을 한곳에서 관리하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationProgramsPage />;
};

export default Page;
