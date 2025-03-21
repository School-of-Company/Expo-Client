import { useRouter } from 'next/navigation';
import { FormValues } from '@/shared/types/form/create/type';
import { transformFormData } from '../../model/formUtils';
import { useCreateApplicationForm } from './useCreateApplicationForm';
import { useCreateSurveyForm } from './useCreateSurveyForm';

export const useCreateFormMutation = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
) => {
  const router = useRouter();

  const {
    mutate: createApplicationForm,
    isPending: isApplicationPending,
    isSuccess: isApplicationSuccess,
  } = useCreateApplicationForm(id, type, router, mode);
  const {
    mutate: createSurveyForm,
    isPending: isSurveyPending,
    isSuccess: isSurveySuccess,
  } = useCreateSurveyForm(id, type, router, mode);

  const handleSubmitForm = (data: FormValues) => {
    const formattedData = transformFormData(data, type, mode);
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
