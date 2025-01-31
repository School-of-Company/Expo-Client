'use client';

import OptionContainer from '@/entities/application/ui/OptionContainer';
import { Button, PageHeader } from '@/shared/ui';
import { useGetForm } from '../../model/useGetForm';

const ApplicationLayout = ({
  params,
  type,
}: {
  params: string;
  type: string;
}) => {
  const { data: formList } = useGetForm(params, type);

  return (
    <div>
      <PageHeader title="신청" />
      <div className="ml-[20px] mt-[48px] flex flex-col gap-[48px]">
        <div className="w-full space-y-[36px]">
          {formList?.dynamicForm?.map((form, index) => (
            <OptionContainer
              key={index}
              title={form.title}
              formType={form.formType}
              jsonData={form.jsonData}
            />
          ))}
        </div>
        <Button text="신청하기" />
      </div>
    </div>
  );
};

export default ApplicationLayout;
