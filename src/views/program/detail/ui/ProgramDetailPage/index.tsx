import { ProgramDetailTable } from '@/features/program/detail';
import { Header } from '@/widgets/layout';

const ProgramDetailPage = ({
  expoId,
  programId,
}: {
  expoId: string;
  programId: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ProgramDetailTable expoId={expoId} programId={programId} />
      </div>
    </div>
  );
};

export default ProgramDetailPage;
