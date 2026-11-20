import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidExpoId } from '@/shared/config';
import { ExhibitionMembersPage } from '@/views/exhibition/members';

export const metadata: Metadata = {
  title: '운영진',
  description:
    '박람회 운영진을 초대하고 역할을 바꾸며, 현장 스태프용 스캔 링크를 발급·회수하는 소유자 전용 페이지입니다.',
};

const Page = ({ params }: { params: { expo_id: string } }) => {
  if (!isValidExpoId(params.expo_id)) notFound();
  return <ExhibitionMembersPage id={params.expo_id} />;
};

export default Page;
