import { Metadata } from 'next';
import { ProgramListPage } from '@/views/program/list';

export const metadata: Metadata = {
  title: '프로그램 목록',
  description:
    '박람회에 등록된 프로그램 정보를 조회하고 관리할 수 있는 관리자 전용 페이지입니다.',
};

const Page = ({ params }: { params: { expo_id: string } }) => {
  return <ProgramListPage expoId={params.expo_id} />;
};

export default Page;
