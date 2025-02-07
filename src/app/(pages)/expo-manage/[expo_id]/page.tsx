import React from 'react';
import { ExpoManage } from '@/views/expo-manage';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div>
      <ExpoManage id={params.expo_id} />
    </div>
  );
};

export default Page;
