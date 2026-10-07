import { Metadata } from 'next';
import { QrSurveyPage } from '@/views/survey-qr';

export const metadata: Metadata = {
  title: '만족도 조사',
  description: '박람회 현장 QR로 만족도 조사에 응답하는 페이지입니다.',
};

const page = ({ params }: { params: { token: string } }) => {
  return <QrSurveyPage token={params.token} />;
};

export default page;
