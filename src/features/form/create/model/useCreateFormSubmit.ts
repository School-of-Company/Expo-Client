import { ApplicationType } from '@/shared/types/exhibition/type';
import { FormValues } from '@/shared/types/form/create/type';
import { transformFormData } from '../../common/model/formUtils';
import { useCreateApplicationForm } from './useCreateApplicationForm';
import { useCreateSurveyForm } from './useCreateSurveyForm';

export const useCreateFormSubmit = (
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
  } = useCreateApplicationForm(id, type);
  const {
    mutate: createSurveyForm,
    isPending: isSurveyPending,
    isSuccess: isSurveySuccess,
  } = useCreateSurveyForm(id, type);

  /** `occupationOpenAt` 은 일반 사전등록만 넘긴다. 생략하면 요청에서도 뺀다 */
  const handleSubmitForm = (
    data: FormValues,
    occupationOpenAt?: string | null,
  ) => {
    const formattedData = transformFormData(
      data,
      type,
      mode,
      applicationType,
      startDate,
      endDate,
      occupationOpenAt,
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
