import { Metadata } from 'next';
import { FutureEduExpoEntryPage } from '@/views/registration/future-edu-expo';

export const metadata: Metadata = {
  title: '미래교육박람회',
  description:
    '미래교육박람회의 사전등록·프로그램 신청 현황 대시보드로 이동하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <FutureEduExpoEntryPage />;
};

export default Page;
