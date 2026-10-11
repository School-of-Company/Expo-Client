import { Metadata } from 'next';
import { PublicSurveyPage } from '@/views/survey-public';

export const metadata: Metadata = {
  title: '만족도 조사',
  description: '박람회 만족도 조사에 응답하는 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  return <PublicSurveyPage expoId={params.expo_id} />;
};

export default page;
