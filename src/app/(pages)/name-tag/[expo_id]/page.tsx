import React from 'react';
import { NameTag } from '@/views/name-tag';

const page = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div>
      <NameTag id={params.expo_id} />
    </div>
  );
};

export default page;
