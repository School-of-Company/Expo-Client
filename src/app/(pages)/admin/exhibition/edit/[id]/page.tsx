import { Metadata } from 'next';
import EditExhibition from '@/views/exhibition/edit/ui/editExhibition';

export const metadata: Metadata = {
  title: '박람회 수정',
  description:
    '등록된 박람회의 정보, 일정, 상세 페이지 등을 수정할 수 있는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { id: string } }) => {
  return <EditExhibition id={params.id} />;
};

export default page;
