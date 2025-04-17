import { OnciteQrPage } from '@/views/onsite-qr';

const page = ({ params }: { params: { id: string } }) => {
  return <OnciteQrPage id={params.id} />;
};

export default page;
