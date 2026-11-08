import { PageViewTracker } from '@/features/application';
import { ApplicationFormsContainer } from '@/features/application/forms';

const ApplicationFormsPage = ({
  params,
  view,
  tab,
}: {
  params: string;
  view?: string;
  tab?: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="flex flex-1 justify-center p-16">
        <PageViewTracker expoId={params} />
        <ApplicationFormsContainer
          expoId={params}
          initialView={view}
          initialTab={tab}
        />
      </div>
    </div>
  );
};

export default ApplicationFormsPage;
