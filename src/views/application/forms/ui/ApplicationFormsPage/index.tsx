import { PageViewTracker } from '@/features/application';
import { ApplicationFormsContainer } from '@/features/application/forms';

const ApplicationFormsPage = ({ params }: { params: string }) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="flex flex-1 justify-center p-16">
        <PageViewTracker expoId={params} />
        <ApplicationFormsContainer expoId={params} />
      </div>
    </div>
  );
};

export default ApplicationFormsPage;
