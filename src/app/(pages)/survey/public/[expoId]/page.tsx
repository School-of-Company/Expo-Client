import { Metadata } from 'next';
import { PublicSurveyPage } from '@/views/survey-public';

export const metadata: Metadata = {
  title: '만족도 조사',
  description:
    '입장 QR 없이 누구나 참여할 수 있는 박람회 만족도 조사 페이지입니다.',
};

const page = ({ params }: { params: { expoId: string } }) => {
  return <PublicSurveyPage expoId={params.expoId} />;
};

export default page;
