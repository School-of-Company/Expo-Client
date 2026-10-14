import { Metadata } from 'next';
import { RegistrationSurveyPage } from '@/views/registration/survey';

export const metadata: Metadata = {
  title: '만족도 조사',
  description:
    '만족도 조사 문항과 경품 추첨을 관리하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationSurveyPage />;
};

export default Page;
