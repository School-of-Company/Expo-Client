import { ApplicationFormContainer } from '@/features/application';

const ApplicationPage = ({ params }: { params: string }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        <ApplicationFormContainer params={params} />
      </div>
    </div>
  );
};

export default ApplicationPage;
