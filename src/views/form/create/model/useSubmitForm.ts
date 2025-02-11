import { useRouter, useSearchParams } from 'next/navigation';
import { FormValues } from '@/shared/types/form/create/type';
import { transformFormData } from '../model/formUtils';
import { useCreateApplicationForm } from './useCreateApplicationForm';
import { useCreateSurveyForm } from './useCreateSurveyForm';

export const useSubmitForm = (id: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation');

  const {
    mutate: createApplicationForm,
    isPending: isApplicationPending,
    isSuccess: isApplicationSuccess,
  } = useCreateApplicationForm(id, navigation, router);
  const {
    mutate: createSurveyForm,
    isPending: isSurveyPending,
    isSuccess: isSurveySuccess,
  } = useCreateSurveyForm(id, navigation, router);

  const handleSubmitForm = (data: FormValues) => {
    const formattedData = transformFormData(data, navigation);

    if (navigation === 'standard_survey' || navigation === 'trainee_survey') {
      createSurveyForm(formattedData);
    } else {
      createApplicationForm(formattedData);
    }
  };

  return {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  };
};
