import { Metadata } from 'next';
import { ExhibitionParticipantsPage } from '@/views/exhibition/participants';

export const metadata: Metadata = {
  title: '참가자 목록',
  description:
    '박람회 참가자 정보를 조회하고 관리할 수 있는 관리자 전용 페이지입니다.',
};

const Page = ({ params }: { params: { expo_id: string } }) => {
  return <ExhibitionParticipantsPage id={params.expo_id} />;
};

export default Page;
