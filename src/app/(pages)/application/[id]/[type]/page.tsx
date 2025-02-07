import React from 'react';
import Application from '@/views/application/ui/application';

const page = ({ params }: { params: { id: string; type: string } }) => {
  return (
    <div>
      <Application params={params.id} type={params.type} />
    </div>
  );
};

export default page;
