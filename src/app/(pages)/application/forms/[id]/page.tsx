import { Metadata } from 'next';
import { ApplicationFormsPage } from '@/views/application/forms';

export const metadata: Metadata = {
  title: '신청하기',
  description:
    '박람회에서 신청할 수 있는 사전등록·현장등록·만족도 조사 폼을 한곳에서 확인하고 바로 신청할 수 있는 참가자 전용 페이지입니다.',
};

// 요청 시점에 환경변수를 읽어야 박람회가 바뀌어도 재배포 없이 따라간다
export const dynamic = 'force-dynamic';

const page = ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string; tab?: string };
}) => {
  // 현재 박람회(/apply 가 보내는 곳)에만 사전등록 안내 문구를 붙인다. 서버 환경변수라 여기서 비교해 내려보낸다
  const isMainExpo =
    !!process.env.MAIN_EXPO_ID && process.env.MAIN_EXPO_ID === params.id;
  return (
    <ApplicationFormsPage
      params={params.id}
      isMainExpo={isMainExpo}
      view={searchParams.view}
      tab={searchParams.tab}
    />
  );
};

export default page;
