import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedApplicationData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from '../process/processDynamicFormData';

export const createStandardApplicationFormatter = (
  dynamicFormItems: DynamicFormItem[],
) => {
  return (
    data: DynamicFormValues & { privacyConsent: boolean },
  ): FormattedApplicationData => {
    return {
      informationJson: JSON.stringify(
        processDynamicFormData(data, dynamicFormItems),
      ),
      ...(data.privacyConsent !== undefined && {
        personalInformationStatus: data.privacyConsent,
      }),
    };
  };
};
