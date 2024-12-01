import React from 'react';
import { ProgramDetail } from '@/views/program-detail';

const page = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div>
      <ProgramDetail params={params} />
    </div>
  );
};

export default page;
