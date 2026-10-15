import { Metadata } from 'next';
import { RegistrationParticipantsPage } from '@/views/registration/participants';

export const metadata: Metadata = {
  title: '참가자 검색',
  description:
    'QR 을 분실한 참가자를 검색해 입장 QR 을 확인하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationParticipantsPage />;
};

export default Page;
