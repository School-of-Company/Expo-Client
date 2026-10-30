import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeExpoId } from '@/shared/config';
import { PrintStationPage } from '@/views/exhibition/print-station';

export const metadata: Metadata = {
  title: '명찰 출력대',
  description:
    '입구에서 입장한 교사·연수자의 명찰을 프린터가 연결된 노트북에서 자동으로 출력하는 운영자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  // 입장 스캔과 같은 박람회 ID 로 작업이 저장되므로 입장 화면과 같은 규칙으로 맞춘다
  const expoId = normalizeExpoId(params.expo_id);
  if (!expoId) notFound();
  return <PrintStationPage expoId={expoId} />;
};

export default page;
