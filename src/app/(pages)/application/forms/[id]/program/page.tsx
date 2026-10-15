import { Metadata } from 'next';
import { ProgramApplyContainer } from '@/features/application/forms';

export const metadata: Metadata = {
  title: '프로그램 신청',
  description: '일반 프로그램을 골라 프로그램별로 신청하는 페이지입니다.',
};

const page = ({ params }: { params: { id: string } }) => (
  <div className="flex min-h-screen flex-col">
    <div className="flex flex-1 justify-center p-16">
      <ProgramApplyContainer expoId={params.id} programType="STANDARD" />
    </div>
  </div>
);

export default page;
