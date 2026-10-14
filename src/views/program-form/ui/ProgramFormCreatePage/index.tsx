'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormBuilder } from '@/features/form-builder';
import {
  ProgramFormBuilderSlotProps,
  ProgramFormCreate,
} from '@/features/program-form';
import { getRegistrationRoutes } from '@/shared/config';
import { DetailHeader } from '@/shared/ui';
import { Header } from '@/widgets/layout';

const renderBuilder = (props: ProgramFormBuilderSlotProps) => (
  <FormBuilder variant="program" {...props} />
);

const ProgramFormCreatePage = () => {
  const { expoId } = useParams<{ expoId: string }>();

  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <div className="w-full max-w-[1000px] space-y-[30px]">
          <DetailHeader
            className="gap-12"
            onBack={() => router.push(getRegistrationRoutes(expoId).dashboard)}
            headerTitle="프로그램용 폼 만들기"
          />
          <ProgramFormCreate expoId={expoId} renderBuilder={renderBuilder} />
        </div>
      </div>
    </div>
  );
};

export default ProgramFormCreatePage;
