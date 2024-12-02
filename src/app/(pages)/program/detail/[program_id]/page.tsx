import React from 'react';
import { ProgramDetail } from '@/views/program-detail';

const page = ({ params }: { params: { program_id: number } }) => {
  return (
    <div>
      <ProgramDetail id={params.program_id} />
    </div>
  );
};

export default page;
