import { Metadata } from 'next';
import { SignUpPage } from '@/views/signup';

export const metadata: Metadata = {
  title: '관리자 회원가입',
  description:
    'Expo 관리자 계정을 생성하는 페이지입니다. 회원가입 후 박람회 등록, 참가자 관리, 프로그램 설정 기능을 이용할 수 있습니다.',
};

const Page = () => {
  return <SignUpPage />;
};

export default Page;
