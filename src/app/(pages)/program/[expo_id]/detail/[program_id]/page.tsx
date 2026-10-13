import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { toLowercaseUuid } from '@/shared/config';
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
  // programId(int64)를 출석 API 경로에 그대로 쓰므로 양의 정수가 아니면 들어오지 못하게 한다
  if (!/^[1-9]\d*$/.test(params.program_id)) notFound();
  // 출석 요청 본문의 expoId를 출석 서버가 소문자로 맞추지 않고 박람회·참가자 확인과 취소 보호 락이 대소문자를 가린다.
  // 그래서 소문자로 맞추고 UUID가 아니면 들어오지 못하게 한다
  const expoId = toLowercaseUuid(params.expo_id);
  if (!expoId) notFound();
  return <ProgramDetailPage expoId={expoId} programId={params.program_id} />;
};

export default page;
