import { ApplicationPage } from '@/views/application/form';

const page = ({ params }: { params: { id: string } }) => {
  return <ApplicationPage params={params.id} />;
};

export default page;
