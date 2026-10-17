import { Metadata } from 'next';
import { RegistrationSchedulePage } from '@/views/registration/schedule';

export const metadata: Metadata = {
  title: '신청관리 제어',
  description:
    '사전등록 회차와 프로그램 모집 정책(정원·모집 기간·대기 승급)을 관리하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationSchedulePage />;
};

export default Page;
