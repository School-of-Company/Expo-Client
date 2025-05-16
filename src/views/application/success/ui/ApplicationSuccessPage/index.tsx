import { SuccessCheck } from '@/entities/application';

const ApplicationSuccessPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center p-16">
        <SuccessCheck />
      </div>
    </div>
  );
};

export default ApplicationSuccessPage;
