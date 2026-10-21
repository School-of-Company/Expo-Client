import { PageViewTracker } from '@/features/application';
import { ApplicationFormsContainer } from '@/features/application/forms';

const ApplicationFormsPage = ({
  params,
  isMainExpo,
  view,
  tab,
}: {
  params: string;
  isMainExpo?: boolean;
  view?: string;
  tab?: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="flex flex-1 justify-center p-16">
        <PageViewTracker expoId={params} />
        <ApplicationFormsContainer
          expoId={params}
          isMainExpo={isMainExpo}
          initialView={view}
          initialTab={tab}
        />
      </div>
    </div>
  );
};

export default ApplicationFormsPage;
