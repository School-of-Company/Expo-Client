import { ApplicationType } from '@/shared/types/exhibition/type';
import { FormValues } from '@/shared/types/form/create/type';
import { transformFormData } from '../../common/model/formUtils';
import { useCreateApplicationForm } from './useCreateApplicationForm';
import { useCreateSurveyForm } from './useCreateSurveyForm';

export const useCreateFormMutation = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
  applicationType: ApplicationType,
  startDate: string,
  endDate: string,
) => {
  const {
    mutate: createApplicationForm,
    isPending: isApplicationPending,
    isSuccess: isApplicationSuccess,
  } = useCreateApplicationForm(id, type, startDate, endDate);
  const {
    mutate: createSurveyForm,
    isPending: isSurveyPending,
    isSuccess: isSurveySuccess,
  } = useCreateSurveyForm(id, type, startDate, endDate);

  const handleSubmitForm = (data: FormValues) => {
    const formattedData = transformFormData(
      data,
      type,
      mode,
      applicationType,
      id,
      startDate,
      endDate,
    );
    const submitFunction =
      mode === 'survey' ? createSurveyForm : createApplicationForm;
    submitFunction(formattedData);
  };

  return {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  };
};
