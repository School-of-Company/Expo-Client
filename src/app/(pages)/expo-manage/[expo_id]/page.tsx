import React from 'react';
import { ExpoManage } from '@/views/expo-manage';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return <ExpoManage id={params.expo_id} />;
};

export default Page;
