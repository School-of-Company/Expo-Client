import { Metadata } from 'next';
import { ApplicationPage } from '@/views/application/form';

export const metadata: Metadata = {
  title: '박람회 등록',
  description:
    'Expo 박람회 참가 등록 및 만족도 조사에 응답할 수 있는 참가자 전용 페이지입니다.',
};

const page = ({ params }: { params: { id: string } }) => {
  return <ApplicationPage params={params.id} />;
};

export default page;
