import React from 'react';
import { ExpoCreated } from '@/views/expo-created';

const page = ({ params }: { params: { expo_id: string } }) => {
  return <ExpoCreated id={params.expo_id} />;
};

export default page;
