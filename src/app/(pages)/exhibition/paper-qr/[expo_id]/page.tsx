import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { toLowercaseUuid } from '@/shared/config';
import { ExhibitionPaperQrPage } from '@/views/exhibition/paper-qr';

export const metadata: Metadata = {
  title: '현장 배부용 QR 인쇄',
  description:
    '현장에서 나눠 줄 입장용 종이 QR을 구분별로 발급하고 A4·라벨로 인쇄하는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  // 발급 API는 소문자 UUID가 아니면 400이라, 형식이 다르면 들어오지 못하게 한다
  const expoId = toLowercaseUuid(params.expo_id);
  if (!expoId) notFound();
  return <ExhibitionPaperQrPage id={expoId} />;
};

export default page;
