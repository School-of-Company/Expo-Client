import { SurveyManager } from '@/features/survey-admin';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationSurveyPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <SurveyManager />
      </div>
    </div>
  );
};

export default RegistrationSurveyPage;
