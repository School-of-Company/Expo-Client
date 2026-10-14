import { DynamicFormItem } from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { createStandardApplicationFormatter } from './formatter/createStandardApplicationFormatter';
import { createTraineeApplicationFormatter } from './formatter/createTraineeApplicationFormatter';

export const getFormatter = (
  userType: 'STANDARD' | 'TRAINEE',
  dynamicFormItems: DynamicFormItem[],
  applicationType?: ApplicationType,
) =>
  userType === 'TRAINEE'
    ? createTraineeApplicationFormatter(dynamicFormItems)
    : createStandardApplicationFormatter(dynamicFormItems, applicationType);
