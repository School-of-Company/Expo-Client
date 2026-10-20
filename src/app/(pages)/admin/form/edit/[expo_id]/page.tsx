import { Metadata } from 'next';
import EditForm from '@/views/form/edit/ui/EditForm';

export const metadata: Metadata = {
  title: '폼 수정',
  description:
    '박람회 참가자 등록 폼과 만족도 조사 폼을 수정할 수 있는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  return <EditForm id={params.expo_id} />;
};

export default page;
