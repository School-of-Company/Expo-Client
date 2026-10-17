import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeExpoId, toLowercaseUuid } from '@/shared/config';
import { ExhibitionQrPage } from '@/views/exhibition/qr';

export const metadata: Metadata = {
  title: 'QR',
  description:
    '현장 등록 QR 띄우기, 참가자 입장 QR 스캔, 현장 배부용 종이 QR 발급·인쇄를 한 곳에서 하는 운영자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  // 출석 서버는 expoId를 소문자로 맞추지 않고 박람회 ID 비교가 대소문자를 가려 대문자면 404가 난다.
  // UUID는 소문자로 맞추고, 숫자 ID는 관리 화면과 같이 그대로 받는다
  const checkInId = normalizeExpoId(params.expo_id);
  if (!checkInId) notFound();
  return (
    <ExhibitionQrPage
      id={params.expo_id}
      checkInId={checkInId}
      paperQrId={toLowercaseUuid(params.expo_id)}
    />
  );
};

export default page;
