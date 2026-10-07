import { Metadata } from 'next';
import { PreRegisterPage } from '@/views/application/forms';

export const metadata: Metadata = {
  title: '참가자 선택 및 신청',
  description:
    '인증한 번호로 등록한 참가자를 선택하거나 새 참가자를 추가해 박람회 사전등록을 신청하는 페이지입니다.',
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
