import { useRouter } from 'next/navigation';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { FormValues } from '@/shared/types/form/create/type';
import { transformFormData } from '../../common/model/formUtils';
import { useEditApplicationForm, useEditSurveyForm } from './useEditForm';

export const useEditFormMutation = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
  apllication: ApplicationType,
) => {
  const router = useRouter();

  const {
    mutate: editApplicationForm,
    isPending: isApplicationPending,
    isSuccess: isApplicationSuccess,
  } = useEditApplicationForm(id, type, router);

  const {
    mutate: editSurveyForm,
    isPending: isSurveyPending,
    isSuccess: isSurveySuccess,
  } = useEditSurveyForm(id, type, router);

  const handleSubmitForm = (data: FormValues) => {
    const formattedData = transformFormData(data, type, mode, apllication);
    const submitFunction =
      mode === 'survey' ? editSurveyForm : editApplicationForm;
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
