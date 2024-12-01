import React from 'react';
import { Header } from '@/widgets/layout';
import { ProgramDetailForm } from '@/widgets/program-detail';

const ProgramDetail = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <ProgramDetailForm params={params} />
    </div>
  );
};

export default ProgramDetail;
