import { ExhibitionParticipantsPage } from '@/views/exhibition/participants';

const Page = ({ params }: { params: { expo_id: string } }) => {
  return <ExhibitionParticipantsPage id={params.expo_id} />;
};

export default Page;
