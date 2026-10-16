import { Metadata } from 'next';
import { RegistrationAttendancePage } from '@/views/registration/attendance';

export const metadata: Metadata = {
  title: '실시간 입·퇴장 현황',
  description:
    '행사장 입장·퇴장 처리 건수와 출입 기록을 실시간으로 확인하는 관리자 전용 페이지입니다.',
};

const Page = () => {
  return <RegistrationAttendancePage />;
};

export default Page;
