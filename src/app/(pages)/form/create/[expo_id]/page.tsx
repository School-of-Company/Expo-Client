import React from 'react';
import { CreateForm } from '@/views/form/create';

const page = ({ params }: { params: { expo_id: string } }) => {
  return <CreateForm id={params.expo_id} />;
};

export default page;
