import { Metadata } from 'next';
import { ApplicationLandingPage } from '@/views/application/landing';

export const metadata: Metadata = {
  title: '박람회 안내',
  description:
    '박람회 등록을 마친 참가자가 박람회 사진과 소개를 확인하고 내 신청·QR을 보거나 다른 프로그램을 신청하는 페이지입니다.',
};

const page = ({ params }: { params: { id: string } }) => {
  return <ApplicationLandingPage expoId={params.id} />;
};

export default page;
