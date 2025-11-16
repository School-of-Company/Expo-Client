import { DynamicFormItem } from '@/shared/types/application/type';
import { createStandardApplicationFormatter } from './formatter/createStandardApplicationFormatter';
import { createSurveyFormatter } from './formatter/createSurveyFormatter';
import { createTraineeApplicationFormatter } from './formatter/createTraineeApplicationFormatter';

export const getFormatter = (
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  dynamicFormItems: DynamicFormItem[],
  queryPhoneNumber?: string | null,
) => {
  const formatters = {
    application: {
      TRAINEE: createTraineeApplicationFormatter(dynamicFormItems),
      STANDARD: createStandardApplicationFormatter(dynamicFormItems),
    },
    survey: {
      TRAINEE: createSurveyFormatter(dynamicFormItems, queryPhoneNumber),
      STANDARD: createSurveyFormatter(dynamicFormItems, queryPhoneNumber),
    },
  };

  return formatters[formType][userType];
};
