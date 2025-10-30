import { useGetApplicationForm, useGetSurveyForm } from '@/shared/queries';
import { ApplicationType } from '@/shared/types/exhibition/type';

export const useGetForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
  formType: 'application' | 'survey',
  applicationType: ApplicationType,
) => {
  if (formType === 'application') {
    return useGetApplicationForm(id, userType, applicationType);
  }
  return useGetSurveyForm(id, userType, applicationType);
};
