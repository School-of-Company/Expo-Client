import React from 'react';
import { CreateForm } from '@/views/create-form';

const page = ({ params }: { params: { expo_id: string } }) => {
  return <CreateForm id={params.expo_id} />;
};

export default page;
