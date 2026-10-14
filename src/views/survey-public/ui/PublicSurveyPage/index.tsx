import { PublicSurveyContainer } from '@/features/survey-answer';

const PublicSurveyPage = ({ expoId }: { expoId: string }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        <PublicSurveyContainer expoId={expoId} />
      </div>
    </div>
  );
};

export default PublicSurveyPage;
