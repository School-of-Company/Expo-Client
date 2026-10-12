import { Metadata } from 'next';
import { RegistrationOperationsPage } from '@/views/registration/operations';

export const metadata: Metadata = {
  title: '박람회 운영',
  description:
    '참가자 조회, 폼 생성, 현장 등록·입장 QR, 프로그램, 문자 전송, 종이 QR, 경품 추첨, 수정을 한곳에서 여는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationOperationsPage />;
};

export default Page;
