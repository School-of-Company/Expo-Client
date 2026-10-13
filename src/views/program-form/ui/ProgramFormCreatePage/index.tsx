'use client';

import { useParams } from 'next/navigation';
import { ProgramFormCreate } from '@/features/program-form';
import { Header } from '@/widgets/layout';

// TODO(FormBuilder): 머지되면 renderBuilder 로 주입한다
const ProgramFormCreatePage = () => {
  const { expoId } = useParams<{ expoId: string }>();

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ProgramFormCreate expoId={expoId} />
      </div>
    </div>
  );
};

export default ProgramFormCreatePage;
