import React from 'react';
import Application from '@/views/application/ui/application';

const page = ({ params }: { params: { id: string } }) => {
  return <Application params={params.id} />;
};

export default page;
