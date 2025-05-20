import { Metadata } from 'next';
import { AdminPage } from '@/views/admin';

export const metadata: Metadata = {
  title: '관리자',
  description: 'Expo 박람회를 관리할 수 있는 관리자 전용 페이지입니다.',
};

const page = () => {
  return <AdminPage />;
};

export default page;
