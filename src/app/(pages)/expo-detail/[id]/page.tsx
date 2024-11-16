import React from 'react';
import ExpoDetail from '@/views/expo-detail/ui/expo-detail';

const page = ({ params }: { params: { id: number } }) => {
  return (
    <div>
      <ExpoDetail params={params.id} />
    </div>
  );
};

export default page;
