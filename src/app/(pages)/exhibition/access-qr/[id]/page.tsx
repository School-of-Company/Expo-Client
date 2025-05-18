import { ExhibitionAccessQrPage } from '@/views/exhibition/access-qr';

const page = ({ params }: { params: { id: string } }) => {
  return <ExhibitionAccessQrPage id={params.id} />;
};

export default page;
