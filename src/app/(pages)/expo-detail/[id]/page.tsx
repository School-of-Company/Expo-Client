import React from 'react';
import ExpoDetail from '@/views/expo-detail/ui/expo-detail';

const page = ({ params }: { params: { id: string } }) => {
  return <ExpoDetail params={params.id} />;
};

export default page;
