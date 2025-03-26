import React from 'react';
import ExpoDetail from '@/views/expo-detail/ui/expo-detail';

const page = ({ params }: { params: { id: number } }) => {
  return <ExpoDetail params={params.id} />;
};

export default page;
