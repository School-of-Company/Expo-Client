import { Metadata } from 'next';
import { PhoneVerificationPage } from '@/views/phone-verification';

export const metadata: Metadata = {
  title: '휴대전화 본인 인증',
  description:
    'Expo 박람회 프로그램 신청 및 QR 발급을 위한 휴대전화 본인 인증 페이지입니다.',
};

const Page = () => {
  return <PhoneVerificationPage />;
};

export default Page;
