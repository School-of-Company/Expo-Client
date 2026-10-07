import { PreRegisterContainer } from '@/features/application/forms';

const PreRegisterPage = ({
  expoId,
  sessionId,
}: {
  expoId: string;
  sessionId: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        <PreRegisterContainer expoId={expoId} sessionId={sessionId} />
      </div>
    </div>
  );
};

export default PreRegisterPage;
