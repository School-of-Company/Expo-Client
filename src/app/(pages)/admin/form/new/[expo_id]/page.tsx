import { Metadata } from 'next';
import FormCreateEntryPage from '@/views/form/new/ui/FormCreateEntryPage';

export const metadata: Metadata = {
  title: '폼 만들기',
  description:
    '박람회 등록용 폼·만족도 조사·프로그램 폼 중 만들 폼을 고르는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  return <FormCreateEntryPage expoId={params.expo_id} />;
};

export default page;
