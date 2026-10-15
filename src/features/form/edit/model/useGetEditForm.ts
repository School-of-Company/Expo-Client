import { useFormQuery } from '@/entities/form';
import { useSurveyQuery } from '@/entities/survey';
import { ApplicationType } from '@/shared/types/exhibition/type';

export const useGetEditForm = (
  id: string,
  userType: 'STANDARD' | 'TRAINEE',
  formType: 'application' | 'survey',
  applicationType: ApplicationType,
) => {
  if (formType === 'application') {
    return useFormQuery(id, userType, applicationType, { admin: true });
  }
  return useSurveyQuery(id, userType, { admin: true });
};
