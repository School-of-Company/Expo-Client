import { useQuery } from '@tanstack/react-query';
import { getEditApplicationForm } from '../api/getEditApplicationForm';
import { getEditSurveyForm } from '../api/getEditSurveyForm';

export const useGetFormData = (
  id: string,
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
) => {
  const { data: applicationForm, isLoading: isApplicationLoading } = useQuery({
    queryKey: ['getEditApplicationForm', id, type],
    queryFn: () => getEditApplicationForm(id, type),
    enabled: mode === 'application',
  });

  const { data: surveyForm, isLoading: isSurveyLoading } = useQuery({
    queryKey: ['getEditSurveyForm', id, type],
    queryFn: () => getEditSurveyForm(id, type),
    enabled: mode === 'survey',
  });

  const formData = mode === 'application' ? applicationForm : surveyForm;
  const isLoading =
    mode === 'application' ? isApplicationLoading : isSurveyLoading;

  return { formData, isLoading };
};
