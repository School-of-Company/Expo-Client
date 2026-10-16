import { Metadata } from 'next';
import { ProgramFormListPage } from '@/views/program-form';

export const metadata: Metadata = {
  title: '프로그램용 폼',
  description:
    '회차 신청에 쓰는 프로그램용 폼을 만들고 다시 편집하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <ProgramFormListPage />;
};

export default Page;
