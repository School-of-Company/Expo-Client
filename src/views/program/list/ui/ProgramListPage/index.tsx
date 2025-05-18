import React from 'react';
import { ProgramListTable } from '@/features/program/list';
import { Header } from '@/widgets/layout';

const ProgramListPage = ({ expoId }: { expoId: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ProgramListTable expoId={expoId} />
      </div>
    </div>
  );
};

export default ProgramListPage;
