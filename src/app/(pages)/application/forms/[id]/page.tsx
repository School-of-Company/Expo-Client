import { Metadata } from 'next';
import { ApplicationFormsPage } from '@/views/application/forms';

export const metadata: Metadata = {
  title: '신청 폼 모음',
  description:
    '박람회에서 신청할 수 있는 사전등록·현장등록·만족도 조사 폼을 한곳에서 확인하고 바로 신청할 수 있는 참가자 전용 페이지입니다.',
};

const page = ({ params }: { params: { id: string } }) => {
  return <ApplicationFormsPage params={params.id} />;
};

export default page;
