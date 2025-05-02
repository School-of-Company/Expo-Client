import React from 'react';
import { Header } from '@/widgets/layout';
import { ProgramForm } from '@/widgets/program';

const Program = ({ expoId }: { expoId: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ProgramForm expoId={expoId} />
      </div>
    </div>
  );
};

export default Program;
