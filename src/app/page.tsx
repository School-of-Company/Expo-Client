import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DEFAULT_EXPO_ID, EXPO_LIST_PATH } from '@/shared/config';
import { ApplicationFormsPage } from '@/views/application/forms';

export const metadata: Metadata = {
  title: '신청 폼 모음',
  description:
    '박람회에서 신청할 수 있는 사전등록·현장등록·만족도 조사 폼을 한곳에서 확인하고 바로 신청할 수 있는 참가자 전용 페이지입니다.',
};

// 주소는 `/` 그대로 두고 env 로 정한 박람회의 신청 폼 모음을 보여 준다
export default function Home() {
  if (!DEFAULT_EXPO_ID) redirect(EXPO_LIST_PATH);
  return <ApplicationFormsPage params={DEFAULT_EXPO_ID} />;
}
