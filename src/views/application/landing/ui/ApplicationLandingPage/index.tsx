import { ExpoLandingContainer } from '@/features/application';

const ApplicationLandingPage = ({ expoId }: { expoId: string }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        <ExpoLandingContainer expoId={expoId} />
      </div>
    </div>
  );
};

export default ApplicationLandingPage;
