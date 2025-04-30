import React from 'react';
import { Header } from '@/widgets/layout';
import { ProgramDetailForm } from '@/widgets/program-detail';

const ProgramDetail = ({
  expoId,
  programId,
}: {
  expoId: string;
  programId: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ProgramDetailForm expoId={expoId} programId={programId} />
      </div>
    </div>
  );
};

export default ProgramDetail;
