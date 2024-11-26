import React from 'react';
import Application from '@/views/application/ui/application';

const page = ({ params }: { params: { id: number } }) => {
  return (
    <div>
      <Application params={params.id} />
    </div>
  );
};

export default page;
