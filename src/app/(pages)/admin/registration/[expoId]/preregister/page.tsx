import { Metadata } from 'next';
import { RegistrationPreregisterPage } from '@/views/registration/preregister';

export const metadata: Metadata = {
  title: '사전등록 관리대장',
  description: '행사 사전등록 신청을 조회·필터하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationPreregisterPage />;
};

export default Page;
