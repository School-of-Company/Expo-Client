import React from 'react';
import { Header } from '@/widgets/layout';
import { ProgramDetailForm } from '@/widgets/program-detail';

const ProgramDetail = ({ id }: { id: number }) => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <ProgramDetailForm id={id} />
    </div>
  );
};

export default ProgramDetail;
