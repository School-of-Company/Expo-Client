import { Metadata } from 'next';
import ProgramDetailPage from '@/views/program/detail/ui/ProgramDetailPage';

export const metadata: Metadata = {
  title: '프로그램 참가자 목록',
  description:
    '선택한 프로그램의 참가자 정보를 확인하고 출석 및 신청 상태를 관리할 수 있는 관리자 전용 페이지입니다.',
};

const page = ({
  params,
}: {
  params: { expo_id: string; program_id: string };
}) => {
  return (
    <ProgramDetailPage expoId={params.expo_id} programId={params.program_id} />
  );
};

export default page;
