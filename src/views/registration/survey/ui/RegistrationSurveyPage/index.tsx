import { SurveyManager } from '@/features/survey-admin';
import { Header } from '@/widgets/layout';

const RegistrationSurveyPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <SurveyManager />
      </div>
    </div>
  );
};

export default RegistrationSurveyPage;
