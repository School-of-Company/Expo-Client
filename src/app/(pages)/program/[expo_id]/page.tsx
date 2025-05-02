import React from 'react';
import { Program } from '@/views/program';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return <Program expoId={params.expo_id} />;
};

export default Page;
