import { ParticipantTable } from '@/features/exhibition/participants';
import { Header } from '@/widgets/layout';

const ExhibitionParticipantsPage = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ParticipantTable id={id} />
      </div>
    </div>
  );
};

export default ExhibitionParticipantsPage;
