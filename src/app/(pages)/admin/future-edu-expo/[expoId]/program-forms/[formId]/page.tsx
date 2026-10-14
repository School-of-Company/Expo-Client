import { Metadata } from 'next';
import { ProgramFormEditPage } from '@/views/program-form';

export const metadata: Metadata = {
  title: '프로그램용 폼 수정',
  description:
    '프로그램 신청에 쓸 폼을 고치고 삭제하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <ProgramFormEditPage />;
};

export default Page;
