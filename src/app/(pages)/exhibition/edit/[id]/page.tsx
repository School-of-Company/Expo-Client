import React from 'react';
import EditExhibition from '@/views/exhibition/edit/ui/editExhibition';

const page = ({ params }: { params: { id: number } }) => {
  return (
    <div>
      <EditExhibition id={params.id} />
    </div>
  );
};

export default page;
