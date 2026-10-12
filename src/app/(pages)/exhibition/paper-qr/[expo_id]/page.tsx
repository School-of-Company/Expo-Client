import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidExpoId } from '@/shared/config';
import { ExhibitionPaperQrPage } from '@/views/exhibition/paper-qr';

export const metadata: Metadata = {
  title: '종이 QR 발급',
  description:
    '현장에서 나눠 줄 입장용 종이 QR을 구분별로 발급하고 라벨로 인쇄하는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  // expoId를 발급 API 경로에 그대로 쓰므로 형식이 다르면 들어오지 못하게 한다
  if (!isValidExpoId(params.expo_id)) notFound();
  return <ExhibitionPaperQrPage id={params.expo_id} />;
};

export default page;
