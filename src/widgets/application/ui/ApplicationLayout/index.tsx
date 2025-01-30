'use client';

import { PageHeader } from '@/shared/ui';
import { useGetForm } from '../../model/useGetForm';

const ApplicationLayout = ({
  params,
  type,
}: {
  params: string;
  type: string;
}) => {
  const { data: expoList } = useGetForm(params, type);
  console.log(expoList);
  return (
    <div>
      <PageHeader title="신청" />
      <div className="ml-[20px] mt-[48px] flex space-y-9">
        <div className="w-full space-y-[36px]">데이터</div>
      </div>
    </div>
  );
};

export default ApplicationLayout;
