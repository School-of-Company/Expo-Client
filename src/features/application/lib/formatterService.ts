import { DynamicFormItem } from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { createStandardApplicationFormatter } from './formatter/createStandardApplicationFormatter';
import { createSurveyFormatter } from './formatter/createSurveyFormatter';
import { createTraineeApplicationFormatter } from './formatter/createTraineeApplicationFormatter';

export const getFormatter = (
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  dynamicFormItems: DynamicFormItem[],
  queryPhoneNumber?: string | null,
  applicationType?: ApplicationType,
) => {
  const formatters = {
    application: {
      TRAINEE: createTraineeApplicationFormatter(dynamicFormItems),
      STANDARD: createStandardApplicationFormatter(
        dynamicFormItems,
        applicationType,
      ),
    },
    survey: {
      TRAINEE: createSurveyFormatter(dynamicFormItems, queryPhoneNumber),
      STANDARD: createSurveyFormatter(dynamicFormItems, queryPhoneNumber),
    },
  };

  return formatters[formType][userType];
};
