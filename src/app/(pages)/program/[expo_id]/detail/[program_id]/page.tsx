import React from 'react';
import { ProgramDetail } from '@/views/program-detail';

const page = ({
  params,
}: {
  params: { expo_id: string; program_id: string };
}) => {
  return (
    <ProgramDetail expoId={params.expo_id} programId={params.program_id} />
  );
};

export default page;
