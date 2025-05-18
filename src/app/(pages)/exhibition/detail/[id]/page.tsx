import { ExhibitionDetailPage } from '@/views/exhibition/detail';

const page = ({ params }: { params: { id: string } }) => {
  return <ExhibitionDetailPage params={params.id} />;
};

export default page;
