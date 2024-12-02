import React from 'react';
import { ProgramDetail } from '@/views/program-detail';

const page = ({ params }: { params: { expo_id: number } }) => {
  return (
    <div>
      <ProgramDetail id={params.expo_id} />
    </div>
  );
};

export default page;
