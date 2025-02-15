'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import FormEditor from '@/views/form/ui/FormEditor';
import { Header } from '@/widgets/layout';

const CreateForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';

  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <FormEditor id={id} type={type} mode={mode} />
    </div>
  );
};

export default CreateForm;
