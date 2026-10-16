import { Metadata } from 'next';
import { RegistrationRosterPage } from '@/views/registration/roster';

export const metadata: Metadata = {
  title: '참가자 명단',
  description:
    '선택일 입장자와 행사 연수자 명단을 조회하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationRosterPage />;
};

export default Page;
