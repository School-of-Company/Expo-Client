import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEFAULT_EXPO_ID } from '@/shared/config';
import { ApplicationFormsPage } from '@/views/application/forms';

export const metadata: Metadata = {
  title: '신청 폼 모음',
  description:
    '박람회에서 신청할 수 있는 사전등록·현장등록·만족도 조사 폼을 한곳에서 확인하고 바로 신청할 수 있는 참가자 전용 페이지입니다.',
};

// 박람회 ID 가 없는 주소는 env 로 정한 박람회를 보여 준다. 정하지 않았으면 열 박람회가 없다
const page = () => {
  if (!DEFAULT_EXPO_ID) notFound();
  return <ApplicationFormsPage params={DEFAULT_EXPO_ID} />;
};

export default page;
