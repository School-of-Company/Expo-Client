'use client';

import { PageHeader } from '@/shared/ui';
import StandardForm from '../form/ApplicationForm/standard';
import TraineeForm from '../form/ApplicationForm/trainee';

const ApplicationLayout = ({ params }: { params: number }) => {
  return (
    <div>
      <PageHeader title="신청" />
      <div className="ml-[20px] mt-[48px] flex space-y-9">
        <div className="w-full space-y-[36px]">
          <TraineeForm params={params} />
          <StandardForm params={params} />
        </div>
      </div>
    </div>
  );
};

export default ApplicationLayout;
