'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import withLoading from '@/shared/hocs/withLoading';
import FormEditor from '@/views/form/ui/FormEditor';
import { Header } from '@/widgets/layout';
import { transformServerData } from '../../model/transformServerData';
import { useGetFormData } from '../../model/useGetFormData';

const EditForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';

  const { formData, isLoading } = useGetFormData(id, type, mode);

  const defaultValues = formData ? transformServerData(formData) : undefined;

  return withLoading({
    isLoading,
    children: (
      <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
        <Header />
        <FormEditor
          id={id}
          type={type}
          mode={mode}
          defaultValues={defaultValues}
        />
      </div>
    ),
  });
};

export default EditForm;
