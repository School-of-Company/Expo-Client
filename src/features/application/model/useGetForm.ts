import { useGetApplicationForm } from '@/shared/queries/useGetApplicationForm';
import { useGetSurveyForm } from '@/shared/queries/useGetSurveyForm';

export const useGetForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
  formType: 'application' | 'survey',
) => {
  if (formType === 'application') {
    return useGetApplicationForm(id, userType);
  }
  return useGetSurveyForm(id, userType);
};
