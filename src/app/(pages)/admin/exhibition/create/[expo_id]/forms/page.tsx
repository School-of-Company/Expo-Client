import { Metadata } from 'next';
import ExhibitionFormSetup from '@/views/exhibition/create/ui/ExhibitionFormSetup';

export const metadata: Metadata = {
  title: '박람회 생성 - 폼 설정',
  description:
    '박람회를 만든 직후 등록용 폼과 만족도 조사를 한 화면에서 만드는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  return <ExhibitionFormSetup expoId={params.expo_id} />;
};

export default page;
