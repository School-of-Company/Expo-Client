import React from 'react';
import { Header } from '@/widgets/layout';
import { ProgramForm } from '@/widgets/program';

const Program = ({ id }: { id: string }) => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <ProgramForm id={id} />
    </div>
  );
};

export default Program;
