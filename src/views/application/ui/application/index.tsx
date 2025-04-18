import React from 'react';
import ApplicationLayout from '@/widgets/application/ui/ApplicationLayout';

const Application = ({ params }: { params: string }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        <ApplicationLayout params={params} />
      </div>
    </div>
  );
};

export default Application;
