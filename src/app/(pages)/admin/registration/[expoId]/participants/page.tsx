import { Metadata } from 'next';
import { RegistrationParticipantsPage } from '@/views/registration/participants';

export const metadata: Metadata = {
  title: '참가자',
  description:
    '선택한 날짜에 입장한 참가자를 조회하는 관리자 전용 페이지입니다.',
};

const Page = ({ params }: { params: { expoId: string } }) => {
  return <RegistrationParticipantsPage expoId={params.expoId} />;
};

export default Page;
