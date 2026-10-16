import { Metadata } from 'next';
import { HomePage } from '@/views/home';

export const metadata: Metadata = {
  title: 'Expo | 박람회 운영 서비스',
  description:
    '박람회 사전등록·프로그램 신청·QR 입장·참가 현황을 한 곳에서 관리하는 박람회 운영 서비스입니다.',
};

export default function Home() {
  return <HomePage />;
}
