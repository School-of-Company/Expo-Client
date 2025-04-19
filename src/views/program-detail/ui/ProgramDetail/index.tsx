import React from 'react';
import { Header } from '@/widgets/layout';
import { ProgramDetailForm } from '@/widgets/program-detail';

const ProgramDetail = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ProgramDetailForm id={id} />
      </div>
    </div>
  );
};

export default ProgramDetail;
