import { useGetApplicationForm, useGetSurveyForm } from '@/shared/queries';

export const useGetEditForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
  formType: 'application' | 'survey',
) => {
  if (formType === 'application') {
    return useGetApplicationForm(id, userType);
  }
  return useGetSurveyForm(id, userType);
};
