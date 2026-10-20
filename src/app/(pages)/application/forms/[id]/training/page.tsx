import { Metadata } from 'next';
import { ProgramApplyContainer } from '@/features/application/forms';

export const metadata: Metadata = {
  title: '연수 신청',
  description: '연수 프로그램을 골라 프로그램별로 신청하는 페이지입니다.',
};

const page = ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { category?: string };
}) => (
  <div className="flex min-h-screen flex-col">
    <div className="flex flex-1 justify-center p-16">
      <ProgramApplyContainer
        expoId={params.id}
        programType="TRAINING"
        category={searchParams.category}
      />
    </div>
  </div>
);

export default page;
