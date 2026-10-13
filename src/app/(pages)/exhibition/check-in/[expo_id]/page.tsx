import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { toLowercaseUuid } from '@/shared/config';
import { ExhibitionCheckInPage } from '@/views/exhibition/check-in';

export const metadata: Metadata = {
  title: '박람회 입장 체크인',
  description:
    '참가자의 QR 코드를 스캔하여 박람회 입장을 확인하고 체크인 정보를 기록할 수 있는 운영자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  // 출석 서버는 expoId를 소문자로 맞추지 않고 박람회 ID 비교가 대소문자를 가려 대문자면 404가 난다.
  // 현장 입장·요약 API는 소문자 UUID가 아니면 400이라, 소문자로 맞추고 UUID가 아니면 들어오지 못하게 한다
  const expoId = toLowercaseUuid(params.expo_id);
  if (!expoId) notFound();
  return <ExhibitionCheckInPage id={expoId} />;
};

export default page;
