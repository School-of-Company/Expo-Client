import { Metadata } from 'next';
import { RegistrationHistoryPage } from '@/views/registration/history';

export const metadata: Metadata = {
  title: '행정 이력',
  description:
    '사전등록·신청 관련 관리자 처리 이력을 확인하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationHistoryPage />;
};

export default Page;
