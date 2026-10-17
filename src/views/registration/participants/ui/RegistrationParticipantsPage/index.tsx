import { ParticipantTable } from '@/features/exhibition/participants';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationParticipantsPage = ({ expoId }: { expoId: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <ParticipantTable id={expoId} />
      </div>
    </div>
  );
};

export default RegistrationParticipantsPage;
