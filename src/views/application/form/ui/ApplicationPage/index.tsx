import { ApplicationFormContainer } from '@/features/application';
import { SurveyAnswerContainer } from '@/features/survey-answer';

const ApplicationPage = ({
  params,
  formType,
}: {
  params: string;
  formType?: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 justify-center p-16">
        {formType === 'survey' ? (
          <SurveyAnswerContainer expoId={params} />
        ) : (
          <ApplicationFormContainer params={params} />
        )}
      </div>
    </div>
  );
};

export default ApplicationPage;
