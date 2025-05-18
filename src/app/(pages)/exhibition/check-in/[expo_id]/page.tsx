import { ExhibitionCheckInPage } from '@/views/exhibition/check-in';

const page = ({ params }: { params: { expo_id: string } }) => {
  return <ExhibitionCheckInPage id={params.expo_id} />;
};

export default page;
