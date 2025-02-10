import React from 'react';
import EditExhibition from '@/views/exhibition/edit/ui/editExhibition';

const page = ({ params }: { params: { id: number } }) => {
  return <EditExhibition id={params.id} />;
};

export default page;
