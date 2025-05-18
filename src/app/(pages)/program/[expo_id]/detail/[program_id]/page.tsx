import ProgramDetailPage from '@/views/program/detail/ui/ProgramDetailPage';

const page = ({
  params,
}: {
  params: { expo_id: string; program_id: string };
}) => {
  return (
    <ProgramDetailPage expoId={params.expo_id} programId={params.program_id} />
  );
};

export default page;
