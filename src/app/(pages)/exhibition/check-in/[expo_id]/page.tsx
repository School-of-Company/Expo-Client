import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidExpoId } from '@/shared/config';
import { ExhibitionCheckInPage } from '@/views/exhibition/check-in';

export const metadata: Metadata = {
  title: '박람회 입장 체크인',
  description:
    '참가자의 QR 코드를 스캔하여 박람회 입장을 확인하고 체크인 정보를 기록할 수 있는 운영자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  // expoId를 입장 스캔 API 경로에 쓰므로 형식이 다르면 들어오지 못하게 한다
  if (!isValidExpoId(params.expo_id)) notFound();
  return <ExhibitionCheckInPage id={params.expo_id} />;
};

export default page;
