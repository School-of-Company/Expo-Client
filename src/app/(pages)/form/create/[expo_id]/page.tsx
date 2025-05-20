import { Metadata } from 'next';
import CreateForm from '@/views/form/create/ui/createForm';

export const metadata: Metadata = {
  title: '폼 생성',
  description:
    '박람회 참가자 등록 폼과 만족도 조사 폼을 생성할 수 있는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  return <CreateForm id={params.expo_id} />;
};

export default page;
