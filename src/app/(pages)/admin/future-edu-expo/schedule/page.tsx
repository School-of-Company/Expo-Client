import { Metadata } from 'next';
import { RegistrationSchedulePage } from '@/views/registration/schedule';

export const metadata: Metadata = {
  title: '일정·모집 제어',
  description:
    '프로그램·회차·정원·신청기간·대기자 승급 정책을 관리하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationSchedulePage />;
};

export default Page;
