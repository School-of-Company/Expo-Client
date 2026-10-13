'use client';

import { useParams } from 'next/navigation';
import { ProgramFormCreate } from '@/features/program-form';
import { getRegistrationRoutes } from '@/shared/config';
import { DetailHeader } from '@/shared/ui';
import { Header } from '@/widgets/layout';

// TODO(FormBuilder): 머지되면 renderBuilder 로 주입한다
const ProgramFormCreatePage = () => {
  const { expoId } = useParams<{ expoId: string }>();

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <div className="w-full max-w-[1000px] space-y-[30px]">
          <DetailHeader
            className="gap-12"
            backHref={getRegistrationRoutes(expoId).dashboard}
            headerTitle="프로그램용 폼 만들기"
          />
          <ProgramFormCreate expoId={expoId} />
        </div>
      </div>
    </div>
  );
};

export default ProgramFormCreatePage;
