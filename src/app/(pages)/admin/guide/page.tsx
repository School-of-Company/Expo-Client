import { Metadata } from 'next';
import { GuidePage } from '@/views/guide';

export const metadata: Metadata = {
  title: '사용법',
  description:
    '박람회 생성부터 폼·QR·현장등록·명찰 출력까지 Expo 관리자 기능의 사용법을 안내하는 페이지입니다.',
};

const page = () => {
  return <GuidePage />;
};

export default page;
