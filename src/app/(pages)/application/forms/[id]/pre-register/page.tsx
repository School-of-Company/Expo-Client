import { Metadata } from 'next';
import { PreRegisterPage } from '@/views/application/forms';

export const metadata: Metadata = {
  title: '사전등록 신청',
  description:
    '대표자가 동행자까지 한 번에 박람회 사전등록을 신청하는 페이지입니다.',
};

const page = ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { sessionId?: string };
}) => {
  return (
    <PreRegisterPage
      expoId={params.id}
      sessionId={searchParams.sessionId ?? ''}
    />
  );
};

export default page;
