import { SurveyAnswerContainer } from '@/features/application';

const PublicSurveyPage = ({ expoId }: { expoId: string }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        <SurveyAnswerContainer source={{ kind: 'public', expoId }} />
      </div>
    </div>
  );
};

export default PublicSurveyPage;
