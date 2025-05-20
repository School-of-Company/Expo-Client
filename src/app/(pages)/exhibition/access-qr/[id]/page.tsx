import { Metadata } from 'next';
import { ExhibitionAccessQrPage } from '@/views/exhibition/access-qr';

export const metadata: Metadata = {
  title: '현장 등록 QR 확인',
  description:
    '박람회 현장 등록을 위한 링크를 QR 코드로 제공합니다. 참가자는 QR을 통해 등록 페이지로 이동할 수 있습니다.',
};

const page = ({ params }: { params: { id: string } }) => {
  return <ExhibitionAccessQrPage id={params.id} />;
};

export default page;
