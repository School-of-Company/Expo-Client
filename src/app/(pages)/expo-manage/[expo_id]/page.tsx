import React from 'react';
import { ExpoManage } from '@/views/expo-manage';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div>
      <ExpoManage params={params} />
    </div>
  );
};

export default Page;
