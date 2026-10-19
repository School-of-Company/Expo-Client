import { Metadata } from 'next';
import CreateExhibition from '@/views/exhibition/create/ui/createExhibition';

export const metadata: Metadata = {
  title: '박람회 생성',
  description:
    '새로운 박람회를 생성하고 기본 정보, 일정, 상세 페이지 등을 설정할 수 있는 관리자 전용 페이지입니다.',
};

const page = () => {
  return <CreateExhibition />;
};

export default page;
