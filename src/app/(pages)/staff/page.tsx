import { Metadata } from 'next';
import { StaffScanPage } from '@/views/staff';

export const metadata: Metadata = {
  title: '스태프 스캔',
  description:
    '운영진이 발급한 스태프 링크로 박람회 입장·퇴장·간편입장·프로그램 출석을 처리하는 현장 스태프 전용 화면입니다.',
  // 링크를 아는 사람만 쓰는 화면이라 검색에 올리지 않는다
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

const page = () => <StaffScanPage />;

export default page;
