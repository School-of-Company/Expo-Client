import React from 'react';
import { Program } from '@/views/program';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div>
      <Program params={params} />
    </div>
  );
};

export default Page;
