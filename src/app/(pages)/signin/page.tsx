import { Metadata } from 'next';
import SignIn from '@/views/signin/ui/signIn';

export const metadata: Metadata = {
  title: '로그인',
  description: 'Expo 로그인하여 박람회를 관리해보세요.',
};

const page = () => {
  return <SignIn />;
};

export default page;
