import { Metadata } from 'next';
import SignIn from '@/views/signin/ui/signIn';

export const metadata: Metadata = {
  title: '관리자 로그인',
  description: 'Expo 박람회 운영을 위한 관리자 전용 로그인 페이지입니다.',
};

const page = () => {
  return <SignIn />;
};

export default page;
