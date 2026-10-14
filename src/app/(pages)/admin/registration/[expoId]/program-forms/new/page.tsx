import { Metadata } from 'next';
import { ProgramFormCreatePage } from '@/views/program-form';

export const metadata: Metadata = {
  title: '프로그램용 폼 만들기',
  description: '프로그램 신청에 쓸 폼을 만드는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <ProgramFormCreatePage />;
};

export default Page;
