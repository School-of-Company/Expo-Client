import React from 'react';
import CreateExhibition from '@/views/exhibition/create/ui/createExhibition';

const page = ({ params }: { params: { id: number } }) => {
  console.log(params);
  return (
    <div>
      <CreateExhibition />
    </div>
  );
};

export default page;
