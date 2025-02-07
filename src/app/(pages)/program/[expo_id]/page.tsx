import React from 'react';
import { Program } from '@/views/program';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div>
      <Program id={params.expo_id} />
    </div>
  );
};

export default Page;
