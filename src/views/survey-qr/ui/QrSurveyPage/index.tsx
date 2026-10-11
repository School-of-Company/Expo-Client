import { SurveyAnswerContainer } from '@/features/application';

const QrSurveyPage = ({ token }: { token: string }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        <SurveyAnswerContainer source={{ kind: 'qr', token }} />
      </div>
    </div>
  );
};

export default QrSurveyPage;
