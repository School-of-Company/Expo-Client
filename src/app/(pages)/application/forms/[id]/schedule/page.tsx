import { Metadata } from 'next';
import { ApplicationSchedule } from '@/features/application/forms';

export const metadata: Metadata = {
  title: '신청 가능 일정',
  description:
    '신청 시작 전에도 사전등록·프로그램·교원연수 회차와 신청 기간을 확인하는 페이지입니다.',
};

const page = ({ params }: { params: { id: string } }) => (
  <div className="flex min-h-screen flex-col">
    <div className="flex flex-1 justify-center p-16">
      <ApplicationSchedule expoId={params.id} />
    </div>
  </div>
);

export default page;
