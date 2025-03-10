import { DynamicFormItem } from '@/shared/types/application/type';
import { createStandardApplicationFormatter } from './createStandardApplicationFormatter';
import { createSurveyFormatter } from './createSurveyFormatter';
import { createTraineeApplicationFormatter } from './createTraineeApplicationFormatter';

export const getFormatter = (
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  dynamicFormItems: DynamicFormItem[],
) => {
  const formatters = {
    application: {
      TRAINEE: createTraineeApplicationFormatter(dynamicFormItems),
      STANDARD: createStandardApplicationFormatter(dynamicFormItems),
    },
    survey: {
      TRAINEE: createSurveyFormatter(dynamicFormItems),
      STANDARD: createSurveyFormatter(dynamicFormItems),
    },
  };

  return formatters[formType][userType];
};
