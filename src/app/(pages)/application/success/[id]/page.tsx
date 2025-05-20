import { Metadata } from 'next';
import { ApplicationSuccessPage } from '@/views/application/success';

export const metadata: Metadata = {
  title: '등록 완료',
  description:
    '박람회 등록 또는 만족도 조사가 성공적으로 제출되었습니다. 참여해 주셔서 감사합니다.',
};

const page = () => {
  return <ApplicationSuccessPage />;
};

export default page;
