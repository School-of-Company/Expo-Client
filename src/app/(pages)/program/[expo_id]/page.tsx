import { ProgramListPage } from '@/views/program/list';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return <ProgramListPage expoId={params.expo_id} />;
};

export default Page;
