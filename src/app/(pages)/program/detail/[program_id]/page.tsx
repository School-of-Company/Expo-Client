import React from 'react';
import { ProgramDetail } from '@/views/program-detail';

const page = ({ params }: { params: { program_id: number } }) => {
  return <ProgramDetail id={params.program_id} />;
};

export default page;
