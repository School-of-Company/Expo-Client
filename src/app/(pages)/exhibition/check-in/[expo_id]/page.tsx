import { Metadata } from 'next';
import { ExhibitionCheckInPage } from '@/views/exhibition/check-in';

export const metadata: Metadata = {
  title: '박람회 입장 체크인',
  description:
    '참가자의 QR 코드를 스캔하여 박람회 입장을 확인하고 체크인 정보를 기록할 수 있는 운영자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  return <ExhibitionCheckInPage id={params.expo_id} />;
};

export default page;
