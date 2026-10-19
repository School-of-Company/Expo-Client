import { Metadata } from 'next';
import { ExhibitionDetailPage } from '@/views/exhibition/detail';

export const metadata: Metadata = {
  title: '박람회 상세',
  description:
    '박람회의 개요, 일정, 참가자 입장 데이터를 확인할 수 있는 관리자 전용 상세 페이지입니다.',
};

const page = ({ params }: { params: { id: string } }) => {
  return <ExhibitionDetailPage params={params.id} />;
};

export default page;
