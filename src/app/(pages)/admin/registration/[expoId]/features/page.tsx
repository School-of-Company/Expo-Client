import { Metadata } from 'next';
import { RegistrationFeaturesPage } from '@/views/registration/features';

export const metadata: Metadata = {
  title: '기능 설정',
  description:
    '박람회에서 쓸 기능(등록·입장·프로그램·설문·알림)과 참가자 휴대전화 인증을 켜고 끄는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationFeaturesPage />;
};

export default Page;
